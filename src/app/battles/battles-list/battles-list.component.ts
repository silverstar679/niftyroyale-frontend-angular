import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-battles-list',
  templateUrl: './battles-list.component.html',
})
export class BattlesListComponent {
  battles = [
    {
      address: '0xaFa735aBf851896d922c7501D404a4A35f02f5Ae',
      name: 'NFT Battle Royale - 0xaFa735aBf851896d922c7501D404a4A35f02f5Ae',
    },
    {
      address: '0x9dCC49BD1fe90941E03184beD4b0DB422d1251CA',
      name: 'NFT Battle Royale - 0x9dCC49BD1fe90941E03184beD4b0DB422d1251CA',
    },
    {
      address: '0x520BB8Ed49c03b39a05F31Af47B534C2846af5da',
      name: 'NFT Battle Royale - 0x520BB8Ed49c03b39a05F31Af47B534C2846af5da',
    },
  ];

  constructor(private router: Router) {}

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`battles/status/${address}`]);
  }
}
