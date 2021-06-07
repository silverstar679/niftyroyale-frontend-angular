import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NETWORK } from '../../services/network.token';
import { Contract, CONTRACTS } from '../../../constants/contracts';
import { EthereumNetwork } from '../../../models/nifty-royale.models';

@Component({
  selector: 'app-battles-list',
  templateUrl: './battles-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlesListComponent {
  battles: Contract[];

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private router: Router
  ) {
    this.battles = CONTRACTS[network];
  }

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`battles/status/${address}`]);
  }
}
