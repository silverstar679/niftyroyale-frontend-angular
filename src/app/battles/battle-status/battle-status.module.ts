import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { FiltersComponent } from './filters/filters.component';
import { NftCardComponent } from './nft-card/nft-card.component';
import { PlayerCardComponent } from './player-card/player-card.component';
import { EliminationScreenComponent } from './elimination-screen/elimination-screen.component';
import { BattleStatusComponent } from './battle-status.component';

const ROUTES: Routes = [{ path: '', component: BattleStatusComponent }];

@NgModule({
  declarations: [
    BattleStatusComponent,
    HeaderComponent,
    FiltersComponent,
    NftCardComponent,
    PlayerCardComponent,
    EliminationScreenComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    SharedModule,
    FormsModule,
    ProgressSpinnerModule,
    DropdownModule,
    DialogModule,
  ],
})
export class BattleStatusModule {}
