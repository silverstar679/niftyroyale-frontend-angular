import Web3 from 'web3';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BattleState,
  EthereumNetwork,
  NiftyAssetModel,
} from '../../models/nifty-royale.models';
import { environment } from '../../environments/environment';
import { MetamaskService } from './metamask.service';
import { PlayersService } from './players.service';
import { ETHEREUM } from './ethereum.token';
import { NETWORK } from './network.token';

const { ALCHEMY_KEY, INFURA_KEY } = environment;

@Injectable()
export class ContractService {
  public abi!: any;
  public contract!: any;
  public web3!: any;
  public gasLimit = 400000;
  public gasBuffer = 100000;
  public gasPrice!: string;
  public transactionHash!: string;
  private readonly etherscanBaseAPI: string;
  private readonly infuraProvider: string;
  private readonly alchemyProvider: string;

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    @Inject(ETHEREUM) private ethereum: any,
    private metamaskService: MetamaskService,
    private playersService: PlayersService,
    private http: HttpClient
  ) {
    this.etherscanBaseAPI = `https://api.niftyroyale.com/etherscan/${network}`;
    this.infuraProvider = `https://${network}.infura.io/v3/${INFURA_KEY}`;
    this.alchemyProvider = `https://eth-${network}.alchemyapi.io/v2/${ALCHEMY_KEY}`;
  }

  async init(address: string): Promise<any> {
    try {
      await this._initWeb3();
      await this._getContract(address);

      return Promise.resolve(this.contract);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getDropData(): Promise<any> {
    const [
      baseTokenURI,
      defaultTokenURI,
      winnerTokenURI,
      name,
      ethPrice,
      maxUnits,
      maxMinted,
      totalMinted,
      battleState,
      gasPrice,
    ] = await Promise.all([
      this.contract.methods.baseURI().call(),
      this.contract.methods.defaultTokenURI().call(),
      this.contract.methods.prizeTokenURI().call(),
      this.contract.methods.name().call(),
      this.contract.methods.price().call(),
      this.contract.methods.unitsPerTransaction().call(),
      this.contract.methods.maxSupply().call(),
      this.contract.methods.totalSupply().call(),
      this.contract.methods.getBattleStateInt().call(),
      this.web3.eth.getGasPrice(),
    ]);

    this.gasPrice = gasPrice;

    return {
      defaultURI: `${baseTokenURI}${defaultTokenURI}`,
      winnerURI: `${baseTokenURI}${winnerTokenURI}`,
      name,
      ethPrice,
      maxUnits: Number(maxUnits),
      maxMinted: Number(maxMinted),
      totalMinted: Number(totalMinted),
      battleState: Number(battleState),
    };
  }

  async getBattleName(): Promise<string> {
    const { name } = this.contract.methods;
    return name().call();
  }

  async getBattleState(): Promise<BattleState> {
    const { getBattleStateInt } = this.contract.methods;
    return getBattleStateInt().call();
  }

  async getNextEliminationTimestamp(): Promise<number> {
    const { intervalTime, timestamp } = this.contract.methods;
    const [intervalTimeVal, timestampVal] = (await Promise.all([
      intervalTime().call(),
      timestamp().call(),
    ])) as [number, number];
    const lastElimination = Number(timestampVal) || new Date().getTime();
    const nextElimination = lastElimination + Number(intervalTimeVal) * 60;
    return nextElimination * 1000;
  }

  async getTotalPlayers(): Promise<number> {
    const { totalSupply } = this.contract.methods;
    return totalSupply().call();
  }

  async getTokenURIs(): Promise<any> {
    const { baseURI, defaultTokenURI, prizeTokenURI } = this.contract.methods;
    const [baseTokenURIVal, defaultTokenURIVal, prizeTokenURIVal] =
      (await Promise.all([
        baseURI().call(),
        defaultTokenURI().call(),
        prizeTokenURI().call(),
      ])) as string[];

    const defaultURI = `${baseTokenURIVal}${defaultTokenURIVal}`;
    const winnerURI = `${baseTokenURIVal}${prizeTokenURIVal}`;

    return { defaultURI, winnerURI };
  }

  async getInPlayPlayers(): Promise<string[]> {
    const { getInPlay } = this.contract.methods;
    const tokenIds = (await getInPlay().call()) as string[];

    if (tokenIds.length === 1) {
      const tokenId = tokenIds[0];
      this.playersService.merge(tokenId, {
        tokenId,
        isEliminated: false,
        placement: 1,
      } as NiftyAssetModel);
      return tokenIds;
    }

    for (const tokenId of tokenIds) {
      this.playersService.merge(tokenId, {
        tokenId,
        isEliminated: false,
        placement: 0,
      } as NiftyAssetModel);
    }

    return tokenIds;
  }

  async getEliminatedPlayers(totalPlayers: number): Promise<string[]> {
    const { getOutOfPlay } = this.contract.methods;
    const tokenIds = (await getOutOfPlay().call()) as string[];

    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      this.playersService.merge(tokenId, {
        tokenId,
        isEliminated: true,
        placement: totalPlayers - i,
      } as NiftyAssetModel);
    }

    return tokenIds;
  }

  getOwnerAddresses(totalPlayers: number): Promise<string[]> {
    const { ownerOf } = this.contract.methods;
    const promises = [];

    for (let tokenId = 1; tokenId <= totalPlayers; tokenId++) {
      promises.push(
        ownerOf(tokenId)
          .call()
          .then((address: string) => {
            const ownerAddress = address.toLowerCase();
            const isOwner = this.metamaskService.isOwnerAddress(ownerAddress);
            this.playersService.merge(`${tokenId}`, {
              ownerAddress,
              isOwner,
            } as NiftyAssetModel);
            return ownerAddress;
          })
      );
    }

    return Promise.all(promises);
  }

  async purchaseNFT(quantity: number, value: string): Promise<void> {
    const from = this.metamaskService.currentAccount;
    const gasLimit = this.gasLimit + quantity * this.gasBuffer;
    const gasPrice = await this.web3.eth.getGasPrice();

    return this.contract.methods
      .purchase(quantity)
      .send({ from, value, gasPrice, gasLimit })
      .on('transactionHash', (hash: string) => {
        this.transactionHash = hash;
      });
  }

  private _getContract(address: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.contract || this.contract._address !== address) {
        try {
          const abi = await this._loadABI(address);

          this.contract = new this.web3.eth.Contract(abi, address);

          return resolve(this.contract);
        } catch (error) {
          return reject(error);
        }
      }
      return resolve(this.contract);
    });
  }

  private _initWeb3(): Promise<Web3> {
    return new Promise(async (resolve, reject) => {
      if (!this.web3) {
        try {
          const defaultProvider = Boolean(INFURA_KEY)
            ? this.infuraProvider
            : this.alchemyProvider;
          const metamaskProvider = this.ethereum;
          const provider = Boolean(metamaskProvider)
            ? metamaskProvider
            : defaultProvider;
          this.web3 = new Web3(provider);

          return resolve(this.web3);
        } catch (error) {
          return reject(error);
        }
      }
      return resolve(this.web3);
    });
  }

  private _loadABI(address: string): Promise<any> {
    if (!this.abi) {
      const url = `${this.etherscanBaseAPI}/contract-abi/${address}`;
      return this.http.get<any>(url).toPromise();
    }
    return Promise.resolve(this.abi);
  }
}
