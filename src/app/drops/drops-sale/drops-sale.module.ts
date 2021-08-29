import { CarouselModule } from 'primeng/carousel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { CheckoutPanelComponent } from './checkout-panel/checkout-panel.component';
import { DropsSaleComponent } from './drops-sale.component';

const ROUTES: Routes = [{ path: '', component: DropsSaleComponent }];

@NgModule({
  declarations: [DropsSaleComponent, CheckoutPanelComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    FormsModule,
    SharedModule,
    CarouselModule,
    ProgressSpinnerModule,
  ],
})
export class DropsSaleModule {}
