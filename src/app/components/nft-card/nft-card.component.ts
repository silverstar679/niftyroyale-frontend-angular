import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrls: ['./nft-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NftCardComponent {
  @Input() asset: any;
}
