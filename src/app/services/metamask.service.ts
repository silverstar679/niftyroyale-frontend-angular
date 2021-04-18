import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ETHEREUM } from './ethereum.token';

const ETH_METHODS = {
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
  ETH_ACCOUNTS: 'eth_accounts',
  ETH_REQ_ACCOUNTS: 'eth_requestAccounts',
  WALLET_REQ_PERMISSIONS: 'wallet_requestPermissions',
};

@Injectable()
export class MetamaskService {
  private accountSubject = new BehaviorSubject('');
  public currentAccount$ = this.accountSubject.pipe(distinctUntilChanged());

  constructor(@Inject(ETHEREUM) private ethereum: any) {
    this.ethereum?.on(ETH_METHODS.ACCOUNTS_CHANGED, (accounts: string[]) =>
      this.handleAccountsChanged(accounts)
    );
    this.ethereum?.on(ETH_METHODS.CHAIN_CHANGED, (chainId: string) =>
      this.handleChainChanged(chainId)
    );
  }

  get isMetamaskInstalled(): boolean {
    return Boolean(this.ethereum?.isMetaMask);
  }

  get currentAccount(): string {
    return this.accountSubject.getValue();
  }

  isAccountConnected(): Observable<boolean> {
    return this.currentAccount$.pipe(map(Boolean));
  }

  isAccountOwner(address: string): boolean {
    return address === this.accountSubject.getValue();
  }

  metamaskBtnText(): Observable<string> {
    return this.currentAccount$.pipe(
      map((account) => {
        if (account) {
          return this.formatAddress(account);
        } else {
          return this.isMetamaskInstalled
            ? 'Connect'
            : 'Install MetaMask';
        }
      })
    );
  }

  ethAccounts(): Promise<void> {
    return this.ethereum
      ?.request({ method: ETH_METHODS.ETH_ACCOUNTS })
      .then((accounts: string[]) => this.handleAccountsChanged(accounts))
      .catch((err: any) => console.error(err));
  }

  ethRequestAccounts(): Promise<void> {
    const req = {
      method: ETH_METHODS.ETH_REQ_ACCOUNTS,
      params: [{ eth_accounts: {} }],
    };
    return this.ethereum
      ?.request(req)
      .then((accounts: string[]) => this.handleAccountsChanged(accounts))
      .catch((err: any) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
  }

  walletRequestPermissions(): Promise<void> {
    const req = {
      method: ETH_METHODS.WALLET_REQ_PERMISSIONS,
      params: [{ eth_accounts: {} }],
    };
    return this.ethereum
      ?.request(req)
      .then((permissions: any) => {
        const accountsPermission = permissions.find(
          (permission: any) =>
            permission.parentCapability === ETH_METHODS.ETH_ACCOUNTS
        );
        if (accountsPermission) {
          console.log('eth_accounts permission successfully requested!');
        }
      })
      .catch((err: any) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log('Permissions needed to continue.');
        } else {
          console.error(err);
        }
      });
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      return console.log('Please connect to MetaMask.');
    }
    this.accountSubject.next(accounts[0]);
  }

  private handleChainChanged(chainId: string): void {
    window.location.reload();
  }

  private formatAddress(address: string): string {
    const length = address.length;
    const firstChar = address.slice(0, 6);
    const lastChar = address.slice(length - 4, length);
    return `${firstChar}...${lastChar}`;
  }
}
