import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NiftyAssetModel } from '../../../../models/nifty-royale.models';
import { IMAGE_EXTENSION } from '../../../../models/image-extension';
import { VIDEO_EXTENSION } from '../../../../models/video-extension';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
})
export class NftCardComponent {
  @Input() asset!: NiftyAssetModel;
  @Input() totalPlayers!: number;
  @Output() onBuy = new EventEmitter<void>();

  constructor(private router: Router) {}

  get btnText(): string {
    const ownerText =
      (!this.asset.sell_orders ? 'Sell' : 'Cancel Sale') + ' | View Offer';
    const notOwnerText = !this.asset.sell_orders ? 'Make Offer' : 'Buy';
    return this.asset.isOwner ? ownerText : notOwnerText;
  }

  get isImage(): boolean {
    return IMAGE_EXTENSION.includes(this.asset.extension);
  }

  get isVideo(): boolean {
    return VIDEO_EXTENSION.includes(this.asset.extension);
  }

  get isWinner(): boolean {
    return this.asset.placement === 1;
  }

  get placement(): string {
    return this.asset.placement
      ? `${this.asset.placement}/${this.totalPlayers}`
      : 'N/A';
  }

  goTo(address: string, tokenId: string): Promise<boolean> {
    return this.router.navigate([`store/${address}/${tokenId}`]);
  }

  formatAddress(address: string): string {
    const length = address.length;
    const firstChar = address.slice(0, 6);
    const lastChar = address.slice(length - 4, length);
    return `${firstChar}...${lastChar}`;
  }
}
