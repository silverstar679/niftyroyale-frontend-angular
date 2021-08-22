import MetaMaskOnboarding from '@metamask/onboarding';
import { MessageService } from 'primeng/api';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { NETWORK } from '../../services/network.token';
import { MetamaskService } from '../../services/metamask.service';
import { SEVERITY, SUMMARY } from '../../../models/toast.enum';
import { EthereumNetwork } from '../../../models/nifty-royale.models';

const currentUrl = new URL(window.location.href);
const isLocalhost = currentUrl.hostname === 'localhost';
const forwarderOrigin = isLocalhost ? 'http://localhost:4200' : undefined;

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  public isConnected = false;
  public metamaskBtnText = '';

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private metamaskService: MetamaskService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.metamaskService.ethAccounts();
    this.metamaskService.account$.subscribe((account) => {
      this.isConnected = Boolean(account);
      if (this.isConnected) {
        this.metamaskBtnText = this.metamaskService.formatAddress(account);
        this.messageService.add({
          severity: SEVERITY.SUCCESS,
          summary: SUMMARY.CONNECTED,
        });
      } else {
        this.metamaskBtnText = this.metamaskService.metamaskBtnText;
        this.messageService.add({
          severity: SEVERITY.INFO,
          summary: SUMMARY.NOT_CONNECTED,
        });
      }
      if (this.metamaskService.isWrongNetwork) {
        this.messageService.add({
          severity: SEVERITY.ERROR,
          summary: `${SUMMARY.WRONG_NETWORK}${this.network.toUpperCase()}.`,
          sticky: true,
          closable: false,
        });
      }
      this.cdr.detectChanges();
    });
  }

  async onConnection(): Promise<void> {
    if (this.metamaskService.isMetamaskInstalled) {
      await this.metamaskService.ethRequestAccounts();
    } else {
      const onBoarding = new MetaMaskOnboarding({ forwarderOrigin });
      onBoarding.startOnboarding();
    }
  }
}
