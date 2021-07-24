import { MessageService } from 'primeng/api';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { SEVERITY, SUMMARY } from '../../models/toast.enum';
import { ETHEREUM } from './ethereum.token';

const ADMIN_WALLET = '0x453e23826f0CfF7655b6A7e866123013923Ae818';

enum ETH_METHODS {
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
  ETH_ACCOUNTS = 'eth_accounts',
  ETH_REQ_ACCOUNTS = 'eth_requestAccounts',
  WALLET_REQ_PERMISSIONS = 'wallet_requestPermissions',
}

@Injectable()
export class MetamaskService {
  private accountSubject = new BehaviorSubject('');
  public account$ = this.accountSubject.pipe(distinctUntilChanged());

  constructor(
    @Inject(ETHEREUM) private ethereum: any,
    private messageService: MessageService
  ) {
    this.ethereum?.on(ETH_METHODS.ACCOUNTS_CHANGED, (accounts: string[]) => {
      window.location.reload();
    });
    this.ethereum?.on(ETH_METHODS.CHAIN_CHANGED, (chainId: string) => {
      window.location.reload();
    });
  }

  get chainId(): string {
    return this.ethereum?.chainId;
  }

  get currentAccount(): string {
    return this.accountSubject.getValue();
  }

  get isMetamaskInstalled(): boolean {
    return Boolean(this.ethereum?.isMetaMask);
  }

  get isAdminWallet(): boolean {
    return ADMIN_WALLET.toLowerCase() === this.currentAccount;
  }

  isOwnerAddress(address: string): boolean {
    return address === this.currentAccount;
  }

  async ethAccounts(): Promise<void> {
    try {
      const accounts = await this.ethereum?.request({
        method: ETH_METHODS.ETH_ACCOUNTS,
      });
      this.handleAccountsChanged(accounts);
    } catch (error) {
      this.errorHandler(error);
    }
  }

  async ethRequestAccounts(): Promise<void> {
    try {
      const accounts = await this.ethereum?.request({
        method: ETH_METHODS.ETH_REQ_ACCOUNTS,
        params: [{ eth_accounts: {} }],
      });
      this.handleAccountsChanged(accounts);
    } catch (error) {
      this.errorHandler(error);
    }
  }

  private errorHandler(error: any): void {
    if (error.code === 4001) {
      // EIP-1193 userRejectedRequest error
      this.messageService.add({
        severity: SEVERITY.ERROR,
        summary: SUMMARY.NOT_CONNECTED,
      });
    } else {
      this.messageService.add({
        severity: SEVERITY.ERROR,
        summary: error.message,
      });
    }
  }

  private handleAccountsChanged(accounts: string[]): void {
    const account = accounts?.length > 0 ? accounts[0] : '';
    this.accountSubject.next(account.toLowerCase());
  }
}
