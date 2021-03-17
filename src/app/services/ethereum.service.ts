import { Inject, Injectable } from '@angular/core';
import { ETHEREUM } from './ethereum.token';

@Injectable()
export class EthereumService {
  constructor(@Inject(ETHEREUM) public ethereum: any) {}

  get isMetamaskInstalled(): boolean {
    return this.ethereum?.isMetaMask;
  }

  get isConnected(): boolean {
    return this.ethereum.isConnected();
  }

  getAccounts(): Promise<string[]> {
    return this.ethereum.request({ method: 'eth_accounts' });
  }

  handleConnection(): Promise<void> {
    return this.ethereum?.request({ method: 'eth_requestAccounts' });
  }
}
