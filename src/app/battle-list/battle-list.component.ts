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
      address: '0x5cF380f0A5f8f5C096e5f3e0E180BA48521Ccb65',
      name: 'NFTBattleRoyale - LAST',
    },
    {
      address: '0x5cF380f0A5f8f5C096e5f3e0E180BA48521Ccb65',
      name: 'NFTBattleRoyale - LAST',
    },
    {
      address: '0x5cF380f0A5f8f5C096e5f3e0E180BA48521Ccb65',
      name: 'NFTBattleRoyale - LAST',
    },
  ];

  constructor(private openSeaService: OpenSeaService, private router: Router) {}

  goTo(address: string): Promise<boolean> {
    return this.router.navigate([`battle-status/${address}`]);
  }
}
