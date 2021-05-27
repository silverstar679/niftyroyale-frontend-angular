import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NETWORK } from '../../services/network.token';
import { Contract, CONTRACTS } from '../../../models/contracts';

@Component({
  selector: 'app-battles-list',
  templateUrl: './battles-list.component.html',
})
export class BattlesListComponent {
  battles: Contract[];

  constructor(@Inject(NETWORK) private network: any, private router: Router) {
    this.battles = CONTRACTS[network];
  }

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`battles/status/${address}`]);
  }
}
