import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './drops-list.component.html',
})
export class DropsListComponent {
  drops = [
    {
      address: '0x9dCC49BD1fe90941E03184beD4b0DB422d1251CA',
      name: 'NFT Battle Royale',
    },
  ];

  constructor(private router: Router) {}

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`drops/sale/${address}`]);
  }
}
