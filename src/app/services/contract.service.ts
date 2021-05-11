import Web3 from 'web3';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ETHEREUM } from './ethereum.token';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

const { network, etherscanApiKey } = environment;
const chain = network || network !== 'mainnet' ? `api-${network}` : 'api';
const etherscanBaseAPI = `https://${chain}.etherscan.io/api`;

@Injectable()
export class ContractService {
  public abi: any;
  public contract: any;
  public web3: any;
  public gasLimit = 1000000;
  public gasPrice = 0;

  constructor(
    @Inject(ETHEREUM) private ethereum: any,
    private http: HttpClient
  ) {}

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

  async getSaleData(): Promise<any> {
    const [
      name,
      ethPrice,
      maxMinted,
      totalMinted,
      battleState,
    ] = await Promise.all([
      this.contract.methods.name().call(),
      this.contract.methods.price().call(),
      this.contract.methods.maxSupply().call(),
      this.contract.methods.totalSupply().call(),
      this.contract.methods.getBattleState().call(),
    ]);

    return {
      name,
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

  getTokenURI(tokenId: string): Promise<string> {
    return this.contract.methods.tokenURI(tokenId).call();
  }

  purchaseNFT(from: string, value: number): Promise<void> {
    return this.contract.methods.purchase(1).send({ from, value });
  }

  private _getAverageGasPrice(): Promise<number> {
    const url = `${etherscanBaseAPI}?module=gastracker&action=gasoracle&apikey=${etherscanApiKey}`;
    return this.http
      .get<any>(url)
      .pipe(map(({ result }) => result.FastGasPrice))
      .toPromise();
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
      const url = `${etherscanBaseAPI}?module=contract&action=getabi&address=${address}&apikey=${etherscanApiKey}&format=raw`;
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
