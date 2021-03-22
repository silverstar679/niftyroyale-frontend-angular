import MetaMaskOnboarding from '@metamask/onboarding';
import { Component, OnInit } from '@angular/core';
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
  title = 'nifty-bots-frontend';
  accounts: string[] = [];
  metamaskBtnDisabled = false;

  constructor(private ethereumService: EthereumService) {}

  async ngOnInit(): Promise<void> {
    this.accounts = await this.ethereumService.getAccounts();
  }

  get isAccountConnected(): boolean {
    return Boolean(this.accounts && this.accounts[0]);
  }

  get metamaskBtnText(): string {
    if (this.isAccountConnected) {
      const length = this.accounts[0].length;
      const firstChar = this.accounts[0].slice(0, 6);
      const lastChar = this.accounts[0].slice(length - 4, length);
      return `${firstChar}...${lastChar}`;
    } else {
      return this.ethereumService.isMetamaskInstalled
        ? 'Connect Wallet'
        : 'Install MetaMask';
    }
  }

  async onMetamaskConnection(): Promise<void> {
    if (this.isAccountConnected) {
      return;
    }
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
      this.accounts = await this.ethereumService.getAccounts();
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
