import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CONTRACTS } from '../../../models/contracts';

@Component({
  selector: 'app-battles-list',
  templateUrl: './battles-list.component.html',
})
export class BattlesListComponent {
  battles = CONTRACTS;

  constructor(private router: Router) {}

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`battles/status/${address}`]);
  }
}
