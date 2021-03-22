import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ETHEREUM } from './ethereum.token';

@Injectable()
export class EthereumService {
  private accountsSubject = new BehaviorSubject<string[]>([]);
  public accounts$ = this.accountsSubject.asObservable();

  constructor(@Inject(ETHEREUM) private ethereum: any) {
    this.ethereum.on('accountsChanged', (accounts: string[]) => {
      this.accountsSubject.next(accounts);
    });
  }

  get isMetamaskInstalled(): boolean {
    return this.ethereum?.isMetaMask;
  }

  handleConnection(): Promise<void> {
    return this.ethereum?.request({ method: 'eth_requestAccounts' });
  }

  async getAccounts(): Promise<void> {
    const accounts = await this.ethereum?.request({ method: 'eth_accounts' });
    this.accountsSubject.next(accounts);
  }
}
