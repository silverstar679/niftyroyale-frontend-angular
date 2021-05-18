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
  dropName = '';
  ethPrice = 0;
  maxMinted = 0;
  totalMinted = 0;
  defaultNftImage = '';
  winnerNftImage = '';
  nftDescription = '';
  battleState = BattleState.STANDBY;
  isPurchaseProcessing = false;
  isPurchaseSuccessful = false;
  isLoading = true;
  showWinnerNftImage = false;

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
    return 'Checkout';
  }

  get ethFees(): number {
    return (this.gasPrice * this.gasLimit) / 10 ** 9;
  }

  get gasLimit(): number {
    return this.contractService.gasLimit;
  }

  get gasPrice(): number {
    return this.contractService.gasPrice;
  }

  get hasBattleStarted(): boolean {
    return this.battleState !== BattleState.STANDBY;
  }

  get isAccountConnected(): boolean {
    return this.metamaskService.isAccountConnected;
  }

  get leftForSale(): string {
    const leftForSale = this.maxMinted - this.totalMinted;
    return `${leftForSale}/${this.maxMinted} left for sale`;
  }

  get nftImageText(): string {
    if (this.showWinnerNftImage) {
      return 'Upgraded NFT Shown. Click on the image to preview base NFT.';
    }
    return 'Base NFT Shown. Click on the image to preview winning NFT upgrade.';
  }

  get transactionHash(): string {
    return this.contractService.transactionHash;
  }

  async ngOnInit(): Promise<void> {
    try {
      const { contractAddress } = this.route.snapshot.params;
      await this.contractService.init(contractAddress);

      const {
        defaultURI,
        winnerURI,
        name,
        ethPrice,
        maxMinted,
        totalMinted,
        battleState,
      } = await this.contractService.getDropData();

      const [defaultIpfsMetadata, winnerIpfsMetadata] = await Promise.all([
        this.openSeaService.getAssetMetadata(defaultURI).toPromise(),
        this.openSeaService.getAssetMetadata(winnerURI).toPromise(),
      ]);

      this.defaultNftImage = defaultIpfsMetadata.image;
      this.winnerNftImage = winnerIpfsMetadata.image;
      this.nftDescription = defaultIpfsMetadata.description;

      this.dropName = name;
      this.ethPrice = Number(ethPrice);
      this.maxMinted = maxMinted;
      this.totalMinted = totalMinted;
      this.battleState = battleState;
      this.isLoading = false;
    } catch (error) {
      this.messageService.add({
        severity: SEVERITY.ERROR,
        summary: SUMMARY.ERROR_OCCURRED,
        detail: error.message,
        sticky: true,
      });
    }
  }

  async buy(): Promise<void> {
    try {
      this.isPurchaseProcessing = true;
      const from = this.metamaskService.currentAccount;
      const value = Number(this.ethPrice) * 10 ** 18;
      this.messageService.add({
        severity: SEVERITY.INFO,
        summary: SUMMARY.TRANSACTION_PROCESS,
        sticky: true,
      });
      await this.contractService.purchaseNFT(from, value);
      this.isPurchaseSuccessful = true;
      this.messageService.clear();
      this.messageService.add({
        severity: SEVERITY.SUCCESS,
        summary: SUMMARY.TRANSACTION_CONFIRMED,
      });
    } catch (error) {
      this.messageService.clear();
      this.messageService.add({
        severity: SEVERITY.ERROR,
        summary: SUMMARY.ERROR_OCCURRED,
        detail: error.message,
        sticky: true,
      });
    }
    this.isPurchaseProcessing = false;
  }

  goToBattle(): Promise<boolean> {
    const { contractAddress } = this.route.snapshot.params;
    return this.router.navigate([`battles/status/${contractAddress}`]);
  }

  formatAddress(address: string): string {
    const length = address.length;
    const firstChar = address.slice(0, 6);
    const lastChar = address.slice(length - 4, length);
    return `${firstChar}...${lastChar}`;
  }
}
