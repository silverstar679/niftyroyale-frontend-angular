import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NETWORK } from '../../../services/network.token';
import {
  EthereumNetwork,
  NiftyAssetModel,
} from '../../../../models/nifty-royale.models';

@Component({
  selector: 'player-card',
  templateUrl: 'player-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCardComponent {
  @Input() player!: NiftyAssetModel;
  @Input() totalPlayers!: number;
  @Input() picture!: string;
  @Input() name!: string;
  @Output() onImageClick = new EventEmitter<string>();

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private route: ActivatedRoute
  ) {}

  get isKovanNetwork(): boolean {
    return this.network === EthereumNetwork.KOVAN;
  }

  openOpenseaTab(tokenId: string): void {
    const network = EthereumNetwork.MAINNET !== this.network ? 'testnets.' : '';
    const address = this.route.snapshot.params.contractAddress;
    window.open(`https://${network}opensea.io/assets/${address}/${tokenId}`);
  }
}
