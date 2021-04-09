import MetaMaskOnboarding from '@metamask/onboarding';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenSeaService } from './services/open-sea.service';
import { OpenSeaAsset } from './models/open-sea-asset.model';
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
  currAccount = '';
  metamaskBtnDisabled = false;
  isAccountConnected$: Observable<boolean>;
  metamaskBtnText$: Observable<string>;
  assets$: Observable<OpenSeaAsset[]>;
  total = 0;
  remaining = 0;
  countdownTimer = '';

  constructor(
    private ethereumService: EthereumService,
    private openSeaService: OpenSeaService
  ) {
    this.initCountdown();
    this.isAccountConnected$ = this.ethereumService.isAccountConnected();
    this.metamaskBtnText$ = this.getMetamaskBtnText();
    this.assets$ = this.getAssets();
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

  private onClickInstall(): void {
    const onBoarding = new MetaMaskOnboarding({ forwarderOrigin });
    onBoarding.startOnboarding();
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

  private getAssets(): Observable<OpenSeaAsset[]> {
    return this.openSeaService.getAssets().pipe(
      map((assets: any[]) => {
        this.total = assets.length;
        this.remaining = assets.length;
        return assets.map((asset) => {
          const isEliminated = Math.random() > 0.5;
          const isOwner = this.currAccount === asset.owner.address;
          let placement = 0;
          if (isEliminated) {
            placement = this.remaining;
            this.remaining = this.remaining - 1;
          }
          return {
            ...asset,
            placement,
            isEliminated,
            isOwner,
          };
        });
      }),
      map((assets: any[]) => {
        const winnerIndex = Math.floor(Math.random() * assets.length);
        assets[winnerIndex].isEliminated = false;
        assets[winnerIndex].placement = 1;
        assets[winnerIndex].isOwner = true;
        return assets;
      })
    );
  }
}
