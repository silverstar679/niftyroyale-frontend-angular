import Web3 from 'web3';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ETHEREUM } from './ethereum.token';
import { NETWORK } from './network.token';
import { EthereumNetwork } from '../../models/nifty-royale.models';
import { environment } from '../../environments/environment';

const { ALCHEMY_KEY, INFURA_KEY } = environment;

@Injectable()
export class ContractService {
  public abi: any;
  public contract: any;
  public web3: any;
  public gasLimit = 500000;
  public gasPrice = 0;
  public transactionHash = '';
  private readonly etherscanBaseAPI: string;
  private readonly infuraProvider: string;
  private readonly alchemyProvider: string;

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    @Inject(ETHEREUM) private ethereum: any,
    private http: HttpClient
  ) {
    this.etherscanBaseAPI = `https://api.niftyroyale.com/etherscan/${network}`;
    this.infuraProvider = `https://${network}.infura.io/v3/${INFURA_KEY}`;
    this.alchemyProvider = `https://eth-${network}.alchemyapi.io/v2/${ALCHEMY_KEY}`;
  }

  async init(address: string): Promise<any> {
    try {
      const [gasPrice] = await Promise.all([
        this._getAverageGasPrice(),
        this._initWeb3(),
      ]);
      this.gasPrice = gasPrice;
      await this._getContract(address, this.gasPrice);

      return Promise.resolve(this.contract);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getBattleData(): Promise<any> {
    const [
      baseTokenURI,
      defaultTokenURI,
      name,
      battleState,
      inPlayPlayers,
      eliminatedPlayers,
      intervalEliminationTime,
      timestamp,
    ] = await Promise.all([
      this.contract.methods.baseURI().call(),
      this.contract.methods.defaultTokenURI().call(),
      this.contract.methods.name().call(),
      this.contract.methods.getBattleState().call(),
      this.contract.methods.getInPlay().call(),
      this.contract.methods.getOutOfPlay().call(),
      this.contract.methods.intervalTime().call(),
      this.contract.methods.timestamp().call(),
    ]);

    const lastEliminationTimestamp = Number(timestamp) || new Date().getTime();
    const nextElimination =
      lastEliminationTimestamp + Number(intervalEliminationTime) * 60;
    const nextEliminationTimestamp = nextElimination * 1000;

    return {
      defaultURI: `${baseTokenURI}${defaultTokenURI}`,
      name,
      battleState,
      inPlayPlayers,
      eliminatedPlayers,
      nextEliminationTimestamp,
    };
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
    ] = await Promise.all([
      this.contract.methods.baseURI().call(),
      this.contract.methods.defaultTokenURI().call(),
      this.contract.methods.prizeTokenURI().call(),
      this.contract.methods.name().call(),
      this.contract.methods.price().call(),
      this.contract.methods.unitsPerTransaction().call(),
      this.contract.methods.maxSupply().call(),
      this.contract.methods.totalSupply().call(),
      this.contract.methods.getBattleState().call(),
    ]);

    return {
      defaultURI: `${baseTokenURI}${defaultTokenURI}`,
      winnerURI: `${baseTokenURI}${winnerTokenURI}`,
      name,
      ethPrice,
      maxUnits,
      maxMinted,
      totalMinted,
      battleState,
    };
  }

  getOwnerAddress(tokenId: string): Promise<string> {
    return this.contract.methods.ownerOf(tokenId).call();
  }

  getTokenURI(tokenId: string): Promise<string> {
    return this.contract.methods.tokenURI(tokenId).call();
  }

  purchaseNFT(from: string, value: number): Promise<void> {
    return this.contract.methods
      .purchase(1)
      .send({ from, value })
      .on('transactionHash', (hash: string) => {
        this.transactionHash = hash;
      });
  }

  private _getAverageGasPrice(): Promise<number> {
    const url = `${this.etherscanBaseAPI}/gas-tracker`;
    return this.http
      .get<any>(url)
      .pipe(map(({ result }) => result.FastGasPrice))
      .toPromise();
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

  private _getContract(address: string, gasPrice: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.contract || this.contract._address !== address) {
        try {
          const abi = await this._loadABI(address);

          this.contract = new this.web3.eth.Contract(abi, address, {
            gasLimit: `${this.gasLimit}`,
            gasPrice: `${gasPrice * 10 ** 9}`,
          });

          return resolve(this.contract);
        } catch (error) {
          return reject(error);
        }
      }
      return resolve(this.contract);
    });
  }
}
