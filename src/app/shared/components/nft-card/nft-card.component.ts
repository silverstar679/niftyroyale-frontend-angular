import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NiftyAssetModel } from '../../../../models/nifty-royale.models';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NftCardComponent {
  @Input() asset!: NiftyAssetModel;
  @Input() contractAddress!: string;
  @Input() totalPlayers!: number;

  constructor(private router: Router) {}

  get btnText(): string {
    const ownerText =
      (!this.asset.sell_orders ? 'Sell' : 'Cancel Sale') + ' | Check Offers';
    const notOwnerText = !this.asset.sell_orders ? 'Make Offer' : 'Buy';
    return this.asset.isOwner ? ownerText : notOwnerText;
  }

  get placement(): string {
    return this.asset.placement
      ? `${this.asset.placement}/${this.totalPlayers}`
      : 'N/A';
  }

  formatAddress(address: string): string {
    const length = address.length;
    const firstChar = address.slice(0, 6);
    const lastChar = address.slice(length - 4, length);
    return `${firstChar}...${lastChar}`;
  }

  goTo(address: string, tokenId: string): Promise<boolean> {
    return this.router.navigate([`store/${address}/${tokenId}`]);
  }
}
