import MetaMaskOnboarding from '@metamask/onboarding';
import { Component, Inject, OnInit } from '@angular/core';
import { BotModel, CurrencyEnum } from './models/bot.model';
import { ETHEREUM } from './services/ethereum.token';
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
  niftyBots: BotModel[] = [];
  accounts: string[] = [];
  metamaskBtnText = '';
  metamaskBtnDisabled = false;

  constructor(private ethereumService: EthereumService) {}

  async ngOnInit(): Promise<void> {
    this.accounts = await this.ethereumService.getAccounts();
    this.metamaskBtnText = this.getMetamaskBtnText();

    // GENERATE FAKE BOTS
    for (let i = 1; i <= 20; i++) {
      this.niftyBots.push({
        name: `Robot ${i}`,
        price: 0.1,
        currency: CurrencyEnum.ETH,
      });
    }
  }

  getMetamaskBtnText(): string {
    if (this.accounts[0]) {
      const length = this.accounts[0].length;
      const firstChar = this.accounts[0].slice(0, 6);
      const lastChar = this.accounts[0].slice(length - 4, length);
      return `${firstChar}...${lastChar}`;
    } else {
      return this.ethereumService.isMetamaskInstalled
        ? 'Connect Wallet'
        : 'Click here to install MetaMask!';
    }
  }

  async onMetamaskConnection(): Promise<void> {
    if (this.ethereumService.isMetamaskInstalled) {
      if (this.ethereumService.isConnected) {
        return;
      }
      await this.onClickConnect();
    } else {
      this.onClickInstall();
    }
    this.metamaskBtnDisabled = false;
  }

  async onClickConnect(): Promise<void> {
    try {
      this.metamaskBtnDisabled = true;
      await this.ethereumService.handleConnection();
      this.accounts = await this.ethereumService.getAccounts();
      this.metamaskBtnText = this.getMetamaskBtnText();
    } catch (error) {
      console.error(error);
    }
  }

  onClickInstall(): void {
    const onBoarding = new MetaMaskOnboarding({ forwarderOrigin });
    this.metamaskBtnText = 'On boarding in progress...';
    this.metamaskBtnDisabled = true;
    onBoarding.startOnboarding();
  }
}
