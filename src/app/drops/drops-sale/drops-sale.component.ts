import { MessageService } from 'primeng/api';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NETWORK } from '../../services/network.token';
import { ContractService } from '../../services/contract.service';
import { MetamaskService } from '../../services/metamask.service';
import { OpenSeaService } from '../../services/open-sea.service';
import {
  BattleState,
  EthereumNetwork,
} from '../../../models/nifty-royale.models';
import { SEVERITY, SUMMARY } from '../../../models/toast.enum';

@Component({
  selector: 'app-drops-sale',
  templateUrl: './drops-sale.component.html',
})
export class DropsSaleComponent implements OnInit, OnDestroy {
  dropName = '';
  ethPrice = 0;
  quantity = 0;
  maxUnits = 0;
  maxMinted = 0;
  totalMinted = 0;
  defaultNftImage = '';
  winnerNftImage = '';
  nftDescription = '';
  artistDescription = '';
  battleState = BattleState.STANDBY;
  hasBattleStarted = false;
  isAccountConnected = false;
  isPurchaseProcessing = false;
  isPurchaseSuccessful = false;
  isLoading = true;
  showWinnerNftImage = false;
  private subscriptions = new Subscription();

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private contractService: ContractService,
    private metamaskService: MetamaskService,
    private openSeaService: OpenSeaService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.subscriptions = this.metamaskService.account$
      .pipe(tap((account) => (this.isAccountConnected = Boolean(account))))
      .subscribe();
  }

  get checkoutBtnText(): string {
    if (this.isPurchaseProcessing) {
      return 'Processing...';
    }
    return 'Checkout';
  }

  get isCheckoutDisabled(): boolean {
    return (
      !this.quantity ||
      this.quantity > this.maxUnits ||
      this.isPurchaseProcessing
    );
  }

  get totalPrice(): number {
    return this.quantity * this.ethPrice;
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

  get etherscanURL(): string {
    const network =
      this.network !== EthereumNetwork.MAINNET ? `${this.network}.` : '';
    return `https://${network}etherscan.io`;
  }

  get transactionURL(): string {
    return `${this.etherscanURL}/tx/${this.transactionHash}`;
  }

  async ngOnInit(): Promise<void> {
    try {
      const { contractAddress } = this.route.snapshot.params;
      await this.contractService.init(contractAddress);
      await this.initDropData();
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
      this.messageService.add({
        severity: SEVERITY.ERROR,
        summary: SUMMARY.ERROR_OCCURRED,
        detail: 'Only 1 purchase per account.',
        sticky: true,
      });
    }
    this.isPurchaseProcessing = false;
  }

  formatAddress(address: string): string {
    const length = address.length;
    const firstChar = address.slice(0, 6);
    const lastChar = address.slice(length - 4, length);
    return `${firstChar}...${lastChar}`;
  }

  goToBattle(): Promise<boolean> {
    const { contractAddress } = this.route.snapshot.params;
    return this.router.navigate([`battles/status/${contractAddress}`]);
  }

  private async initDropData(): Promise<void> {
    const {
      defaultURI,
      winnerURI,
      name,
      ethPrice,
      maxUnits,
      maxMinted,
      totalMinted,
      battleState,
    } = await this.contractService.getDropData();

    const [defaultIpfsMetadata, winnerIpfsMetadata] = await Promise.all([
      this.openSeaService.getAssetMetadata(defaultURI).toPromise(),
      this.openSeaService.getAssetMetadata(winnerURI).toPromise(),
    ]);

    this.nftDescription = defaultIpfsMetadata.description;
    this.defaultNftImage = defaultIpfsMetadata.image;
    this.artistDescription =
      defaultIpfsMetadata.attributes.find(
        (a) => a.trait_type === 'Artist Description:'
      )?.value || '';
    this.winnerNftImage = winnerIpfsMetadata.image;

    this.battleState = battleState;
    this.dropName = name;
    this.ethPrice = Number(ethPrice) / 10 ** 18;
    this.quantity = maxUnits;
    this.maxUnits = maxUnits;
    this.hasBattleStarted = this.battleState !== BattleState.STANDBY;
    this.maxMinted = maxMinted;
    this.totalMinted = totalMinted;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
