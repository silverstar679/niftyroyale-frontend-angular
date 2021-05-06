import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OpenSeaService } from '../services/open-sea.service';

@Component({
  selector: 'app-battle-list',
  templateUrl: './battle-list.component.html',
})
export class BattleListComponent {
  battles = [
    {
      address: '0x9dCC49BD1fe90941E03184beD4b0DB422d1251CA',
      name: 'NFT Battle Royale',
    },
  ];

  constructor(private openSeaService: OpenSeaService, private router: Router) {}

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`battle-status/${address}`]);
  }
}
