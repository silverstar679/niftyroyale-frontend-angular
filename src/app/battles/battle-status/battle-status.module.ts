import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NftCardComponent } from './nft-card/nft-card.component';
import { BattleStatusComponent } from './battle-status.component';

const ROUTES: Routes = [{ path: '', component: BattleStatusComponent }];

@NgModule({
  declarations: [BattleStatusComponent, NftCardComponent],
  imports: [CommonModule, RouterModule.forChild(ROUTES), ProgressSpinnerModule],
})
export class BattleStatusModule {}
