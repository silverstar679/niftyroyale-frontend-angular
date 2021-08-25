import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NETWORK } from '../../services/network.token';
import {
  EthereumNetwork,
  ListItem,
  ListType,
} from '../../../models/nifty-royale.models';

@Component({
  selector: 'app-drops-list',
  templateUrl: './drops-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropsListComponent {
  private subscription: Subscription;
  listType = ListType.DROP;
  activeList!: ListItem[];
  pastList!: ListItem[];

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.subscription = this.route.data.subscribe(({ data }) => {
      this.activeList = data.activeDrops;
      this.pastList = data.pastDrops;
    });
  }

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`drops/sale/${address}`]);
  }
}
