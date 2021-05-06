import Web3 from 'web3';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ETHEREUM } from './ethereum.token';
import { environment } from '../../environments/environment';
import { SEVERITY, SUMMARY } from '../../models/toast.enum';

const { network, etherscanApiKey } = environment;

@Injectable()
export class ContractService {
  abi: any;
  contract: any;
  web3: any;

  constructor(
    @Inject(ETHEREUM) private ethereum: any,
    private messageService: MessageService,
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

  async getBattleData(): Promise<any> {
    const [
      contractCreator,
      baseTokenURI,
      tokenURI,
      ethPrice,
      maxMinted,
      totalMinted,
      battleState,
      inPlayPlayers,
      eliminatedPlayers,
      intervalEliminationTime,
      timestamp,
    ] = await Promise.all([
      this.contract.methods.owner().call(),
      this.contract.methods.baseURI().call(),
      this.contract.methods.defaultTokenURI().call(),
      this.contract.methods.price().call(),
      this.contract.methods.maxSupply().call(),
      this.contract.methods.totalSupply().call(),
      this.contract.methods.getBattleState().call(),
      this.contract.methods.getInPlay().call(),
      this.contract.methods.getOutOfPlay().call(),
      this.contract.methods.intervalTime().call(),
      this.contract.methods.timestamp().call(),
    ]);

    const lastEliminationTimestamp = Number(timestamp) || new Date().getTime();
    const nextEliminationTimestamp =
      lastEliminationTimestamp + Number(intervalEliminationTime) * 60 * 1000;

    return {
      contractCreator,
      baseTokenURI,
      tokenURI,
      ethPrice,
      maxMinted,
      totalMinted,
      battleState,
      inPlayPlayers,
      eliminatedPlayers,
      nextEliminationTimestamp,
    };
  }

  async purchaseNFT(from: string, value: number): Promise<void> {
    try {
      this.messageService.add({
        severity: SEVERITY.INFO,
        summary: SUMMARY.TRANSACTION_PROCESS,
      });
      await this.contract.methods.purchase(1).send({ from, value });
      this.messageService.add({
        severity: SEVERITY.SUCCESS,
        summary: SUMMARY.TRANSACTION_CONFIRMED,
      });
    } catch (error) {
      this.messageService.add({
        severity: SEVERITY.ERROR,
        summary: error.messsage,
      });
    }
  }

  private _initWeb3(): Promise<Web3> {
    return new Promise(async (resolve, reject) => {
      if (!this.web3) {
        try {
          this.web3 = new Web3(this.ethereum);

          return resolve(this.web3);
        } catch (e) {
          return reject(e);
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
      if (!this.contract) {
        try {
          const abi = await this._loadABI(address);

          this.contract = new this.web3.eth.Contract(abi, address, {
            gasLimit: '10000000',
          });

          return resolve(this.contract);
        } catch (e) {
          return reject(e);
        }
      }
      return resolve(this.contract);
    });
  }
}
