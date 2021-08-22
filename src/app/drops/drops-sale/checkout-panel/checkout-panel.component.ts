import { MessageService } from 'primeng/api';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EthereumNetwork } from '../../../../models/nifty-royale.models';
import { SEVERITY, SUMMARY } from '../../../../models/toast.enum';
import { ContractService } from '../../../services/contract.service';
import { MetamaskService } from '../../../services/metamask.service';
import { NETWORK } from '../../../services/network.token';

@Component({
  selector: 'checkout-panel',
  templateUrl: 'checkout-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPanelComponent {
  @Input() dropName!: string;
  @Input() maxUnits!: number;
  @Input() maxMinted!: number;
  @Input() totalMinted!: number;
  @Input() ethPrice!: number;
  @Input() isBattleStarted!: boolean;
  isConnected$: Observable<boolean>;
  isAdminAddress = false;
  isPurchaseProcessing = false;
  isPurchaseSuccessful = false;
  quantity = 1;

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private contractService: ContractService,
    private metamaskService: MetamaskService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isConnected$ = this.metamaskService.account$.pipe(
      map((account) => {
        this.isAdminAddress = this.metamaskService.isAdminAddress(account);
        return Boolean(account);
      })
    );
  }

  get checkoutBtnText(): string {
    if (this.isPurchaseProcessing) {
      return 'Processing...';
    }
    return 'Checkout';
  }

  get isCheckoutDisabled(): boolean {
    if (this.isAdminAddress) {
      return false;
    }

    return (
      !this.quantity ||
      this.quantity > this.maxUnits ||
      this.isPurchaseProcessing
    );
  }

  get maxQuantity(): number {
    return this.leftForSale > this.maxUnits ? this.maxUnits : this.leftForSale;
  }

  get ethFees(): number {
    if (!this.quantity) {
      return 0;
    }
    return (this.gasPrice * this.gasLimit) / 10 ** 9;
  }

  get gasLimit(): number {
    return this.quantity * this.contractService.gasLimit;
  }

  get gasPrice(): number {
    return this.contractService.gasPrice;
  }

  get leftForSale(): number {
    return this.maxMinted - this.totalMinted;
  }

  get totalPrice(): number {
    return this.quantity * this.ethPrice;
  }

  get transactionURL(): string {
    const network =
      this.network !== EthereumNetwork.MAINNET ? `${this.network}.` : '';
    return `https://${network}etherscan.io/tx/${this.transactionHash}`;
  }

  get transactionHash(): string {
    return this.contractService.transactionHash;
  }

  get transactionHashFormatted(): string {
    return this.metamaskService.formatAddress(this.transactionHash);
  }

  get leftForSaleText(): string {
    return `${this.leftForSale}/${this.maxMinted} left for sale`;
  }

  async buy(): Promise<void> {
    try {
      if (this.isCheckoutDisabled) {
        return;
      }
      this.isPurchaseProcessing = true;
      const from = this.metamaskService.currentAccount;
      const quantity = Number(this.quantity);
      const ethPrice = Number(this.ethPrice);
      const value = quantity * ethPrice * 10 ** 18;
      this.messageService.add({
        severity: SEVERITY.INFO,
        summary: SUMMARY.TRANSACTION_PROCESS,
        sticky: true,
      });
      await this.contractService.purchaseNFT(
        from,
        value,
        quantity,
        this.gasLimit
      );
      this.isPurchaseSuccessful = true;
      this.messageService.clear();
      this.messageService.add({
        severity: SEVERITY.SUCCESS,
        summary: SUMMARY.TRANSACTION_CONFIRMED,
      });
    } catch (error) {
      this.messageService.clear();
      const detail =
        error.message.indexOf('transactionHash') !== -1
          ? `Please visit: ${this.transactionURL} for more details.`
          : error.message;
      this.messageService.add({
        sticky: true,
        severity: SEVERITY.ERROR,
        summary: SUMMARY.ERROR_OCCURRED,
        detail,
      });
    }
    this.isPurchaseProcessing = false;
  }

  goToBattle(): Promise<boolean> {
    const { contractAddress } = this.route.snapshot.params;
    return this.router.navigate([`battles/status/${contractAddress}`]);
  }
}
