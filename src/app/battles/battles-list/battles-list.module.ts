import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { BattlesListComponent } from './battles-list.component';

const ROUTES: Routes = [{ path: '', component: BattlesListComponent }];

@NgModule({
  declarations: [BattlesListComponent],
  imports: [CommonModule, RouterModule.forChild(ROUTES), SharedModule],
})
export class BattlesListModule {}
