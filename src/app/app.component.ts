import MetaMaskOnboarding from '@metamask/onboarding';
import { MessageService } from 'primeng/api';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, skip, tap } from 'rxjs/operators';
import { NETWORK } from './services/network.token';
import { MetamaskService } from './services/metamask.service';
import { EthereumNetwork } from '../models/nifty-royale.models';
import { SEVERITY, SUMMARY } from '../models/toast.enum';

const currentUrl = new URL(window.location.href);
const isLocalhost = currentUrl.hostname === 'localhost';
const forwarderOrigin = isLocalhost ? 'http://localhost:4200' : undefined;

const METAMASK_BTN_TEXTS = {
  CONNECT: 'Connect Wallet',
  INSTALL: 'Install MetaMask',
};

const networkChainIds = {
  mainnet: '0x1',
  rinkeby: '0x4',
  kovan: '0x2a',
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  public isAccountConnected = false;
  public isGoodNetwork = false;
  public metamaskBtnText = '';
  private subscriptions = new Subscription();

  private static formatAddress(address: string): string {
    const length = address.length;
    const firstChar = address.slice(0, 6);
    const lastChar = address.slice(length - 4, length);
    return `${firstChar}...${lastChar}`;
  }

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private messageService: MessageService,
    private metamaskService: MetamaskService,
    private router: Router
  ) {
    this.subscriptions = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
        tap(() => this.messageService.clear())
      )
      .subscribe();
  }

  get disconnectedText(): string {
    return this.metamaskService.isMetamaskInstalled
      ? METAMASK_BTN_TEXTS.CONNECT
      : METAMASK_BTN_TEXTS.INSTALL;
  }

  async ngOnInit(): Promise<void> {
    await this.metamaskService.ethAccounts();
    this.subscriptions.add(
      this.metamaskService.account$
        .pipe(
          tap((account: string) => {
            this.isAccountConnected = Boolean(account);
            this.isGoodNetwork =
              networkChainIds[this.network] === this.metamaskService.chainId;
            this.metamaskBtnText = this.isAccountConnected
              ? AppComponent.formatAddress(account)
              : this.disconnectedText;
            if (this.isAccountConnected && !this.isGoodNetwork) {
              return this.messageService.add({
                severity: SEVERITY.ERROR,
                summary: `${
                  SUMMARY.WRONG_NETWORK
                }${this.network.toUpperCase()}.`,
                sticky: true,
                closable: false,
              });
            }
            if (!this.isAccountConnected) {
              return this.messageService.add({
                severity: SEVERITY.INFO,
                summary: SUMMARY.NOT_CONNECTED,
              });
            } else {
              return this.messageService.add({
                severity: SEVERITY.SUCCESS,
                summary: SUMMARY.CONNECTED,
              });
            }
          })
        )
        .subscribe()
    );
  }

  async onConnection(): Promise<void> {
    if (this.metamaskService.isMetamaskInstalled) {
      await this.metamaskService.ethRequestAccounts();
    } else {
      const onBoarding = new MetaMaskOnboarding({ forwarderOrigin });
      onBoarding.startOnboarding();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
