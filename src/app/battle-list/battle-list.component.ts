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
      address: '0x387b8F0a3c1d53d01750874431d26ccfB36A9442',
      name: 'NFT Battle Royale - LAST',
    },
    {
      address: '0x5cF380f0A5f8f5C096e5f3e0E180BA48521Ccb65',
      name: 'NFT Battle Royale - OLD',
    },
    {
      address: '0x9a6a3E23ee281a99F81b887Dd75386f0f3d5341c',
      name: 'NFT Battle Royale - BURNT TOKEN',
    },
  ];

  constructor(private openSeaService: OpenSeaService, private router: Router) {}

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`battle-status/${address}`]);
  }
}
