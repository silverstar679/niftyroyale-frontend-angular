import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { BattleStatusComponent } from './battle-status.component';

const ROUTES: Routes = [{ path: '', component: BattleStatusComponent }];

@NgModule({
  declarations: [BattleStatusComponent],
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
