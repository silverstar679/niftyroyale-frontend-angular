import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { MetamaskService } from '../../services/metamask.service';
import { OpenSeaService } from '../../services/open-sea.service';
import {
  BattleState,
  IpfsMetadataModel,
} from '../../../models/nifty-royale.models';

@Component({
  selector: 'app-drops-sale',
  templateUrl: './drops-sale.component.html',
})
export class DropsSaleComponent implements OnInit {
  ipfsMetadata = {} as IpfsMetadataModel;
  ethPrice = 0;
  maxMinted = 0;
  totalMinted = 0;
  battleState = BattleState.ENDED;
  isPurchaseProcessing = false;

  constructor(
    private contractService: ContractService,
    private metamaskService: MetamaskService,
    private openSeaService: OpenSeaService,
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

  get leftForSale(): string {
    return this.battleState === BattleState.STANDBY
      ? `${this.maxMinted - this.totalMinted}/${this.maxMinted} left for sale`
      : 'Sale is over!';
  }

  async ngOnInit(): Promise<void> {
    const { contractAddress } = this.route.snapshot.params;
    await this.contractService.init(contractAddress);

    const {
      uri,
      ethPrice,
      maxMinted,
      totalMinted,
      battleState,
    } = await this.contractService.getSaleData();

    this.ipfsMetadata = await this.openSeaService
      .getAssetMetadata(uri)
      .toPromise();

    this.ethPrice = ethPrice;
    this.maxMinted = maxMinted;
    this.totalMinted = totalMinted;
    this.battleState = battleState;
  }

  async buy(): Promise<void> {
    this.isPurchaseProcessing = true;
    const from = this.metamaskService.currentAccount;
    const value = Number(this.ethPrice) * 10 ** 18;
    await this.contractService.purchaseNFT(from, value);
    this.isPurchaseProcessing = false;
  }

  goTo(tokenId: string): Promise<boolean> {
    const { contractAddress } = this.route.snapshot.params;
    return this.router.navigate([`store/${contractAddress}/${tokenId}`]);
  }
}
