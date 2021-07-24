import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { NiftyAssetModel } from '../../../../models/nifty-royale.models';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NftCardComponent {
  @Input() player!: NiftyAssetModel;
  @Input() totalPlayers!: number;
  @Input() picture!: string;
  @Input() name!: string;
  @Input() showFooter = true;
  @Output() onImgClick = new EventEmitter<void>();
  @Output() onBtnClick = new EventEmitter<string>();

  get btnTXT(): string {
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
      ? this.formatAddress(this.player.ownerAddress)
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

  private formatAddress(address: string): string {
    const length = address.length;
    const firstChar = address.slice(0, 6);
    const lastChar = address.slice(length - 4, length);
    return `${firstChar}...${lastChar}`;
  }
}
