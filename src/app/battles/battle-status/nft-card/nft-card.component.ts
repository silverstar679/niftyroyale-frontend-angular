import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { NiftyAssetModel } from '../../../../models/nifty-royale.models';
import { MetamaskService } from '../../../services/metamask.service';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NftCardComponent {
  @Input() player!: NiftyAssetModel;
  @Input() name!: string;
  @Input() picture!: string;
  @Input() totalPlayers!: number;
  @Input() showFooter = true;
  @Output() onImgClick = new EventEmitter<void>();
  @Output() onBtnClick = new EventEmitter<string>();

  constructor(private metamaskService: MetamaskService) {}

  get btnText(): string {
    const ownerSellText = this.player.order?.sell ? 'Cancel Sale' : 'Sell';
    const ownerBuyText = this.player.order?.buy ? ' | Check Offers' : '';
    const notOwnerBuyText = this.player.order?.sell
      ? 'Buy | Make Offer'
      : 'Make Offer';
    return this.player.isOwner
      ? `${ownerSellText}${ownerBuyText}`
      : `${notOwnerBuyText}`;
  }

  get ownerAddress(): string {
    return this.player.ownerAddress
      ? this.metamaskService.formatAddress(this.player.ownerAddress)
      : 'Loading...';
  }

  get placement(): string {
    return this.player.placement
      ? `${this.player.placement}/${this.totalPlayers}`
      : 'N/A';
  }

  formatPrice(price: string): number {
    return Number(price) / 10 ** 18;
  }
}
