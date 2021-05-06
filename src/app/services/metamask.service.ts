import { MessageService } from 'primeng/api';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { SEVERITY, SUMMARY } from '../../models/toast.enum';
import { ETHEREUM } from './ethereum.token';

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
      this.handleAccountsChanged(accounts);
    });
    this.ethereum?.on(ETH_METHODS.CHAIN_CHANGED, (chainId: string) => {
      this.handleChainChanged(chainId);
    });
  }

  get currentAccount(): string {
    return this.accountSubject.getValue();
  }

  get isAccountConnected(): boolean {
    return Boolean(this.currentAccount);
  }

  get isMetamaskInstalled(): boolean {
    return Boolean(this.ethereum?.isMetaMask);
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

  async walletRequestPermissions(): Promise<void> {
    try {
      const permissions = await this.ethereum?.request({
        method: ETH_METHODS.WALLET_REQ_PERMISSIONS,
        params: [{ eth_accounts: {} }],
      });
      const accountsPermission = permissions.find((permission: any) => {
        return permission.parentCapability === ETH_METHODS.ETH_ACCOUNTS;
      });
      if (accountsPermission) {
        console.log('eth_accounts permission successfully requested!');
      }
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
    const account = accounts.length > 0 ? accounts[0] : '';
    this.accountSubject.next(account);
  }

  private handleChainChanged(chainId: string): void {
    window.location.reload();
  }
}
