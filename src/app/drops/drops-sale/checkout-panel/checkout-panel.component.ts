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
  @Input() ethPrice!: string;
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

  get leftForSaleText(): string {
    return `${this.leftForSale}/${this.maxMinted} left for sale`;
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

  get ethPriceEther(): string {
    return this.contractService.web3.utils.fromWei(this.ethPrice, 'ether');
  }

  get totalPriceEther(): string {
    const total = `${this.quantity * Number(this.ethPrice)}`;
    return this.contractService.web3.utils.fromWei(total, 'ether');
  }

  get gasPriceGwei(): number {
    return this.contractService.web3.utils.fromWei(
      this.contractService.gasPrice,
      'gwei'
    );
  }

  get totalFeesEther(): number {
    if (!this.quantity) {
      return 0;
    }
    const gasPrice = Number(this.contractService.gasPrice);
    const gasLimit = this.contractService.gasLimit;
    const fees = `${this.quantity * gasPrice * gasLimit}`;
    return this.contractService.web3.utils.fromWei(fees, 'ether');
  }

  get totalPurchaseEther(): number {
    return Number(this.totalPriceEther) + Number(this.totalFeesEther);
  }

  get leftForSale(): number {
    return this.maxMinted - this.totalMinted;
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

  async buy(): Promise<void> {
    try {
      if (this.isCheckoutDisabled) {
        return;
      }
      this.isPurchaseProcessing = true;
      this.messageService.add({
        severity: SEVERITY.INFO,
        summary: SUMMARY.TRANSACTION_PROCESS,
        sticky: true,
      });
      const value = `${this.quantity * Number(this.ethPrice)}`;
      await this.contractService.purchaseNFT(this.quantity, value);
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
