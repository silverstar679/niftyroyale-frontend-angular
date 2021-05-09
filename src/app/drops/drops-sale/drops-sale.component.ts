import { MessageService } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { MetamaskService } from '../../services/metamask.service';
import { OpenSeaService } from '../../services/open-sea.service';
import { BattleState } from '../../../models/nifty-royale.models';
import { SEVERITY, SUMMARY } from '../../../models/toast.enum';

@Component({
  selector: 'app-drops-sale',
  templateUrl: './drops-sale.component.html',
})
export class DropsSaleComponent implements OnInit {
  ethPrice = 0;
  maxMinted = 0;
  totalMinted = 0;
  battleState = BattleState.STANDBY;
  isPurchaseProcessing = false;
  isLoading = true;

  constructor(
    private contractService: ContractService,
    private metamaskService: MetamaskService,
    private openSeaService: OpenSeaService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get checkoutBtnText(): string {
    if (this.isPurchaseProcessing) {
      return 'Processing...';
    }
    return !this.hasBattleStarted ? 'Checkout' : 'Trade';
  }

  get hasBattleStarted(): boolean {
    return this.battleState !== BattleState.STANDBY;
  }

  get isAccountConnected(): boolean {
    return this.metamaskService.isAccountConnected;
  }

  get leftForSale(): string {
    return this.battleState === BattleState.STANDBY
      ? `${this.maxMinted - this.totalMinted}/${this.maxMinted} left for sale`
      : 'Sale is over!';
  }

  async ngOnInit(): Promise<void> {
    const { contractAddress } = this.route.snapshot.params;
    await this.contractService.init(contractAddress);

    const {
      ethPrice,
      maxMinted,
      totalMinted,
      battleState,
    } = await this.contractService.getSaleData();

    this.ethPrice = ethPrice;
    this.maxMinted = maxMinted;
    this.totalMinted = totalMinted;
    this.battleState = battleState;
    this.isLoading = false;
  }

  async buy(): Promise<void> {
    try {
      this.isPurchaseProcessing = true;
      const from = this.metamaskService.currentAccount;
      const value = Number(this.ethPrice) * 10 ** 18;
      this.messageService.add({
        severity: SEVERITY.INFO,
        summary: SUMMARY.TRANSACTION_PROCESS,
      });
      await this.contractService.purchaseNFT(from, value);
      this.messageService.add({
        severity: SEVERITY.SUCCESS,
        summary: SUMMARY.TRANSACTION_CONFIRMED,
      });
      const { contractAddress } = this.route.snapshot.params;
      await this.router.navigate([`battles/status/${contractAddress}`]);
    } catch (error) {
      this.messageService.add({
        severity: SEVERITY.ERROR,
        summary: error.message,
      });
    }
    this.isPurchaseProcessing = false;
  }

  goTo(tokenId: string): Promise<boolean> {
    const { contractAddress } = this.route.snapshot.params;
    return this.router.navigate([`store/${contractAddress}/${tokenId}`]);
  }
}
