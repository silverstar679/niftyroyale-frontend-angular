import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CONTRACTS } from '../../../models/contracts';

@Component({
  selector: 'app-list',
  templateUrl: './drops-list.component.html',
})
export class DropsListComponent {
  drops = CONTRACTS;

  constructor(private router: Router) {}

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`drops/sale/${address}`]);
  }
}
