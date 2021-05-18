import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DropsSaleComponent } from './drops-sale.component';

const ROUTES: Routes = [{ path: '', component: DropsSaleComponent }];

@NgModule({
  declarations: [DropsSaleComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    SharedModule,
    ProgressSpinnerModule,
  ],
})
export class DropsSaleModule {}
