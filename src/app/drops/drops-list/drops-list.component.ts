import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NETWORK } from '../../services/network.token';
import { Contract, CONTRACTS } from '../../../models/contracts';

@Component({
  selector: 'app-list',
  templateUrl: './drops-list.component.html',
})
export class DropsListComponent {
  drops: Contract[];

  constructor(@Inject(NETWORK) private network: any, private router: Router) {
    this.drops = CONTRACTS[network];
  }

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`drops/sale/${address}`]);
  }
}
