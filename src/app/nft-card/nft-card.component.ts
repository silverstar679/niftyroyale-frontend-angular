import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CurrencyEnum } from '../models/bot.model';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrls: ['./nft-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NftCardComponent {
  @Input() name = '';
  @Input() price = 0;
  @Input() currency: CurrencyEnum = CurrencyEnum.ETH;
}
