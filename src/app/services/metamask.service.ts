import { MessageService } from 'primeng/api';
import { ApplicationRef, Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { SEVERITY, SUMMARY } from '../../models/toast.enum';
import { EthereumNetwork } from '../../models/nifty-royale.models';
import { ETHEREUM } from './ethereum.token';
import { NETWORK } from './network.token';

const ADMIN_WALLET = '0x453e23826f0CfF7655b6A7e866123013923Ae818';

enum ETH_METHODS {
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
  ETH_ACCOUNTS = 'eth_accounts',
  ETH_REQ_ACCOUNTS = 'eth_requestAccounts',
  WALLET_REQ_PERMISSIONS = 'wallet_requestPermissions',
}

const METAMASK_BTN_TEXTS = {
  CONNECT: 'Connect Wallet',
  INSTALL: 'Install MetaMask',
};

const NETWORK_CHAIN_ID = {
  [EthereumNetwork.MAINNET]: '0x1',
  [EthereumNetwork.RINKEBY]: '0x4',
  [EthereumNetwork.KOVAN]: '0x2a',
};

@Injectable()
export class MetamaskService {
  private accountSubject = new BehaviorSubject<string>('');
  public account$: Observable<string>;

  constructor(
    @Inject(ETHEREUM) private ethereum: any,
    @Inject(NETWORK) private network: EthereumNetwork,
    private messageService: MessageService,
    private ref: ApplicationRef
  ) {
    this.account$ = this.accountSubject.pipe(distinctUntilChanged());
    this.ethereum?.on(ETH_METHODS.ACCOUNTS_CHANGED, (accounts: string[]) => {
      this.handleAccountsChanged(accounts);
      this.ref.tick();
    });
    this.ethereum?.on(ETH_METHODS.CHAIN_CHANGED, () => {
      window.location.reload();
    });
  }

  get currentAccount(): string {
    return this.accountSubject.getValue();
  }

  get isWrongNetwork(): boolean {
    return this.ethereum?.chainId !== NETWORK_CHAIN_ID[this.network];
  }

  get isMetamaskInstalled(): boolean {
    return Boolean(this.ethereum?.isMetaMask);
  }

  get metamaskBtnText(): string {
    return this.isMetamaskInstalled
      ? METAMASK_BTN_TEXTS.CONNECT
      : METAMASK_BTN_TEXTS.INSTALL;
  }

  isAdminAddress(address: string): boolean {
    return address === ADMIN_WALLET.toLowerCase();
  }

  isOwnerAddress(address: string): boolean {
    return address === this.currentAccount;
  }

  formatAddress(address: string): string {
    const length = address.length;
    const firstChar = address.slice(0, 6);
    const lastChar = address.slice(length - 4, length);
    return `${firstChar}...${lastChar}`;
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

  private handleAccountsChanged(accounts: string[]): void {
    const account = accounts?.length > 0 ? accounts[0].toLowerCase() : '';
    this.accountSubject.next(account);
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
}
