import MetaMaskOnboarding from '@metamask/onboarding';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenSeaService } from './services/open-sea.service';
import { EthereumService } from './services/ethereum.service';
import { ContractService } from './services/contract.service';
import { OpenSeaAsset } from './models/open-sea-asset.model';

const currentUrl = new URL(window.location.href);
const forwarderOrigin =
  currentUrl.hostname === 'localhost' ? 'http://localhost:4200' : undefined;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  currAccount = '';
  metamaskBtnDisabled = false;
  isAccountConnected$: Observable<boolean>;
  metamaskBtnText$: Observable<string>;
  assets: OpenSeaAsset[] = [];
  stillInPlay: string[] = [];
  outOfPlay: string[] = [];
  total = 0;
  countdownTimer = '';

  constructor(
    private ethereumService: EthereumService,
    private openSeaService: OpenSeaService,
    private contractService: ContractService
  ) {
    this.initCountdown();
    this.isAccountConnected$ = this.ethereumService.isAccountConnected();
    this.metamaskBtnText$ = this.getMetamaskBtnText();
  }

  async ngOnInit(): Promise<void> {
    await this.ethereumService.getAccounts();
    const contract = await this.contractService.getContract();
    const [stillInPlay, outOfPlay] = await Promise.all([
      contract.methods.getAllInPlay().call(),
      contract.methods.getAllOutOfPlay().call(),
    ]);
    this.stillInPlay = stillInPlay;
    this.outOfPlay = outOfPlay;
    this.total = stillInPlay.length + outOfPlay.length;
    this.assets = await this.getAssets();
  }

  async onMetamaskConnection(): Promise<void> {
    if (this.ethereumService.isMetamaskInstalled) {
      await this.onClickConnect();
    } else {
      this.onClickInstall();
    }
  }

  initCountdown(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const countDownDate = tomorrow.getTime();

    const x = setInterval(() => {
      // Get today's date and time
      const now = new Date().getTime();

      // Find the distance between now and the count down date
      const distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.countdownTimer = '';

      if (days > 0) {
        this.countdownTimer = this.countdownTimer + days + ':';
      }

      if (hours > 0) {
        this.countdownTimer = this.countdownTimer + hours + ':';
      }

      if (minutes > 0) {
        this.countdownTimer = this.countdownTimer + minutes + ':';
      }

      if (seconds > 0) {
        this.countdownTimer = this.countdownTimer + seconds;
      }

      if (distance < 0) {
        clearInterval(x);
        this.countdownTimer = 'NEW ELIMINATION!';
      }
    }, 1000);
  }

  formatAddress(address: string): string {
    const length = address.length;
    const firstChar = address.slice(0, 6);
    const lastChar = address.slice(length - 4, length);
    return `${firstChar}...${lastChar}`;
  }

  private async getAssets(): Promise<OpenSeaAsset[]> {
    const assets = await this.openSeaService.getAssets();
    return assets.map((asset) => {
      const outOfPlayIndex = this.outOfPlay.indexOf(asset.token_id);
      const isEliminated = outOfPlayIndex !== -1;
      const isOwner = this.currAccount === asset.owner.address;
      const isWinner =
        1 === this.stillInPlay.length && asset.token_id === this.stillInPlay[0];
      let placement = 0;
      if (isWinner) {
        placement = 1;
      } else if (isEliminated) {
        placement = this.total - outOfPlayIndex;
      }
      return {
        ...asset,
        isEliminated,
        isOwner,
        placement,
      };
    });
  }

  private async onClickConnect(): Promise<void> {
    try {
      this.metamaskBtnDisabled = true;
      await this.ethereumService.handleConnection();
      await this.ethereumService.getAccounts();
      this.metamaskBtnDisabled = false;
    } catch (error) {
      console.error(error);
    }
  }

  private getMetamaskBtnText(): Observable<string> {
    return this.ethereumService.accounts$.pipe(
      map((accounts) => {
        const currAccount = accounts && accounts[0];
        if (currAccount) {
          this.currAccount = currAccount;
          return this.formatAddress(currAccount);
        } else {
          return this.ethereumService.isMetamaskInstalled
            ? 'Connect Wallet'
            : 'Install MetaMask';
        }
      })
    );
  }

  private onClickInstall(): void {
    const onBoarding = new MetaMaskOnboarding({ forwarderOrigin });
    onBoarding.startOnboarding();
  }
}
