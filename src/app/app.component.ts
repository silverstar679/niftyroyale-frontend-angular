import MetaMaskOnboarding from '@metamask/onboarding';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EthereumService } from './services/ethereum.service';

const currentUrl = new URL(window.location.href);
const forwarderOrigin =
  currentUrl.hostname === 'localhost' ? 'http://localhost:4200' : undefined;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  metamaskBtnDisabled = false;
  showMenu = false;
  isAccountConnected$: Observable<boolean>;
  metamaskBtnText$: Observable<string>;

  constructor(private ethereumService: EthereumService) {
    this.isAccountConnected$ = this.ethereumService.accounts$.pipe(
      map((accounts) => Boolean(accounts[0]))
    );
    this.metamaskBtnText$ = this.ethereumService.accounts$.pipe(
      map((accounts) => {
        const currAccount = accounts[0];
        if (currAccount) {
          const length = currAccount.length;
          const firstChar = currAccount.slice(0, 6);
          const lastChar = currAccount.slice(length - 4, length);
          return `${firstChar}...${lastChar}`;
        } else {
          return this.ethereumService.isMetamaskInstalled
            ? 'Connect Wallet'
            : 'Install MetaMask';
        }
      })
    );
  }

  async ngOnInit(): Promise<void> {
    await this.ethereumService.getAccounts();
  }

  async onMetamaskConnection(): Promise<void> {
    if (this.ethereumService.isMetamaskInstalled) {
      await this.onClickConnect();
    } else {
      this.onClickInstall();
    }
  }

  async onClickConnect(): Promise<void> {
    try {
      this.metamaskBtnDisabled = true;
      await this.ethereumService.handleConnection();
      await this.ethereumService.getAccounts();
      this.metamaskBtnDisabled = false;
    } catch (error) {
      console.error(error);
    }
  }

  onClickInstall(): void {
    const onBoarding = new MetaMaskOnboarding({ forwarderOrigin });
    onBoarding.startOnboarding();
  }
}
