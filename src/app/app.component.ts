import MetaMaskOnboarding from '@metamask/onboarding';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MetamaskService } from './services/metamask.service';
import { MessageService } from 'primeng/api';

const currentUrl = new URL(window.location.href);
const forwarderOrigin =
  currentUrl.hostname === 'localhost' ? 'http://localhost:4200' : undefined;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  showStatus$: Observable<boolean>;
  isAccountConnected$: Observable<boolean>;
  metamaskBtnText$: Observable<string>;
  metamaskBtnDisabled = false;

  constructor(
    private messageService: MessageService,
    private metamaskService: MetamaskService,
    private router: Router
  ) {
    this.isAccountConnected$ = this.metamaskService.isAccountConnected();
    this.metamaskBtnText$ = this.metamaskService.metamaskBtnText();
    this.showStatus$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as RouterEvent).url.includes('status'))
    );
  }

  async ngOnInit(): Promise<void> {
    await this.metamaskService.ethAccounts();
  }

  async onConnection(): Promise<void> {
    if (this.metamaskService.isMetamaskInstalled) {
      await this.connect();
      this.messageService.add({
        severity: 'success',
        summary: 'Wallet connected!',
      });
    } else {
      this.install();
    }
  }

  private async connect(): Promise<void> {
    try {
      this.metamaskBtnDisabled = true;
      await this.metamaskService.ethRequestAccounts();
      this.metamaskBtnDisabled = false;
    } catch (error) {
      console.error(error);
    }
  }

  private install(): void {
    const onBoarding = new MetaMaskOnboarding({ forwarderOrigin });
    onBoarding.startOnboarding();
  }
}
