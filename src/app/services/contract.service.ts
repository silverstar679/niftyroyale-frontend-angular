import env from 'env';
import Web3 from 'web3';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const { NETWORK, INFURA_KEY, ALCHEMY_KEY } = env;
const FACTORY_CONTRACT_ADDRESS = '0x7Bd0978BaCcD5F0A607D3163D3dB30AB2A48D4a3';
const infuraProvider = `https://${NETWORK}.infura.io/v3/${INFURA_KEY}`;
const alchemyProvider = `https://eth-${NETWORK}.alchemyapi.io/v2/${ALCHEMY_KEY}`;
const provider = Boolean(INFURA_KEY) ? infuraProvider : alchemyProvider;
const web3 = new Web3(provider);

@Injectable()
export class ContractService {
  constructor(private http: HttpClient) {}

  // tslint:disable-next-line:typedef
  async getContract() {
    const ABI = await this.getContractABI();
    return new web3.eth.Contract(ABI, FACTORY_CONTRACT_ADDRESS, {
      gasPrice: '1000000',
    });
  }

  private getContractABI(): Promise<any> {
    const chain = NETWORK || NETWORK !== 'mainnet' ? `api-${NETWORK}` : 'api';
    const url = `https://${chain}.etherscan.io/api?module=contract&action=getabi&address=${FACTORY_CONTRACT_ADDRESS}&format=raw`;
    return this.http.get(url).toPromise();
  }
}
