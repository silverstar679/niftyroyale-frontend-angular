import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NETWORK } from '../../services/network.token';
import { Contract, CONTRACTS } from '../../../constants/contracts';
import { EthereumNetwork } from '../../../models/nifty-royale.models';

@Component({
  selector: 'app-list',
  templateUrl: './drops-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropsListComponent {
  drops: Contract[];

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private router: Router
  ) {
    this.drops = CONTRACTS[network];
  }

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`drops/sale/${address}`]);
  }
}
