import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NETWORK } from '../../services/network.token';
import {
  EthereumNetwork,
  ListItem,
  ListType,
} from '../../../models/nifty-royale.models';
import { CONTRACTS } from '../../../constants/contracts';

@Component({
  selector: 'app-list',
  templateUrl: './drops-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropsListComponent {
  listType = ListType.DROP;
  activeList: ListItem[];
  pastList: ListItem[];

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private router: Router
  ) {
    this.activeList = CONTRACTS[network].active;
    this.pastList = CONTRACTS[network].past;
  }

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`drops/sale/${address}`]);
  }
}
