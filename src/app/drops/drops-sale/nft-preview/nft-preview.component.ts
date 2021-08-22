import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'nft-preview',
  templateUrl: 'nft-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NftPreviewComponent {
  @Input() defaultNftImage!: string;
  @Input() winnerNftImage!: string;
  showWinnerNftImage = false;

  get nftImageText(): string {
    if (this.showWinnerNftImage) {
      return 'Upgraded NFT Shown. Click on the image to preview base NFT.';
    }
    return 'Base NFT Shown. Click on the image to preview winning NFT upgrade.';
  }
}
