import Web3 from 'web3';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ETHEREUM } from './ethereum.token';
import { environment } from '../../environments/environment';

const { network, etherscanApiKey } = environment;

@Injectable()
export class ContractService {
  abi: any;
  contract: any;
  web3: any;

  constructor(
    @Inject(ETHEREUM) private ethereum: any,
    private http: HttpClient
  ) {}

  async init(address: string): Promise<any> {
    try {
      await this._initWeb3();
      await this._getContract(address);

      return Promise.resolve(this.contract);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getSaleData(): Promise<any> {
    const [ethPrice, maxMinted, totalMinted, battleState] = await Promise.all([
      this.contract.methods.price().call(),
      this.contract.methods.maxSupply().call(),
      this.contract.methods.totalSupply().call(),
      this.contract.methods.getBattleState().call(),
    ]);

    return {
      ethPrice,
      maxMinted,
      totalMinted,
      battleState,
    };
  }

  async getBattleData(): Promise<any> {
    const [
      baseTokenURI,
      tokenURI,
      battleState,
      inPlayPlayers,
      eliminatedPlayers,
      intervalEliminationTime,
      timestamp,
    ] = await Promise.all([
      this.contract.methods.baseURI().call(),
      this.contract.methods.defaultTokenURI().call(),
      this.contract.methods.getBattleState().call(),
      this.contract.methods.getInPlay().call(),
      this.contract.methods.getOutOfPlay().call(),
      this.contract.methods.intervalTime().call(),
      this.contract.methods.timestamp().call(),
    ]);

    const uri = `${baseTokenURI}${tokenURI}`;
    const lastEliminationTimestamp = Number(timestamp) || new Date().getTime();
    const nextElimination =
      lastEliminationTimestamp + Number(intervalEliminationTime) * 60;
    const nextEliminationTimestamp = nextElimination * 1000;

    return {
      uri,
      battleState,
      inPlayPlayers,
      eliminatedPlayers,
      nextEliminationTimestamp,
    };
  }

  async purchaseNFT(from: string, value: number): Promise<void> {
    return this.contract.methods.purchase(1).send({ from, value });
  }

  async getTokenURI(tokenId: string): Promise<string> {
    return this.contract.methods.tokenURI(tokenId).call();
  }

  private _initWeb3(): Promise<Web3> {
    return new Promise(async (resolve, reject) => {
      if (!this.web3) {
        try {
          this.web3 = new Web3(this.ethereum);

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
      const chain = network || network !== 'mainnet' ? `api-${network}` : 'api';
      const url = `https://${chain}.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscanApiKey}&format=raw`;
      return this.http.get<any>(url).toPromise();
    }
    return Promise.resolve(this.abi);
  }

  private _getContract(address: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.contract || this.contract._address !== address) {
        try {
          const abi = await this._loadABI(address);

          this.contract = new this.web3.eth.Contract(abi, address, {
            gasLimit: `${10 ** 7}`,
            gasPrice: `${2 * 10 ** 10}`,
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
