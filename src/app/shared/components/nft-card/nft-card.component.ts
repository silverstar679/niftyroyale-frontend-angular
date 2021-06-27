import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  EthereumNetwork,
  NiftyAssetModel,
} from '../../../../models/nifty-royale.models';
import { NETWORK } from '../../../services/network.token';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NftCardComponent {
  @Input() asset!: NiftyAssetModel;
  @Input() contractAddress!: string;
  @Input() totalPlayers!: number;
  @Output() imgClick = new EventEmitter<void>();
  showFooter = true;

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private router: Router
  ) {
    this.showFooter = this.network !== EthereumNetwork.KOVAN;
  }

  get btnText(): string {
    const ownerSellText = this.asset.order.sell ? 'Cancel Sale' : 'Sell';
    const ownerBuyText = this.asset.order.buy ? ' | Check Offers' : '';
    const notOwnerBuyText = this.asset.order.sell
      ? 'Buy | Make Offer'
      : 'Make Offer';
    return this.asset.isOwner
      ? `${ownerSellText}${ownerBuyText}`
      : `${notOwnerBuyText}`;
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

  formatPrice(price: string): number {
    return Number(price) / 10 ** 18;
  }

  openOpenseaTab(address: string, tokenId: string): void {
    const openSeaNetwork =
      EthereumNetwork.MAINNET !== this.network ? 'testnets.' : '';
    const openSeaURL = `https://${openSeaNetwork}opensea.io/assets/${address}/${tokenId}`;
    window.open(openSeaURL);
  }

  goTo(address: string, tokenId: string): Promise<boolean> {
    return this.router.navigate([`store/${address}/${tokenId}`]);
  }
}
