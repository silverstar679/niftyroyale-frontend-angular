import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { NftPreviewComponent } from './nft-preview/nft-preview.component';
import { CheckoutPanelComponent } from './checkout-panel/checkout-panel.component';
import { DropsSaleComponent } from './drops-sale.component';

const ROUTES: Routes = [{ path: '', component: DropsSaleComponent }];

@NgModule({
  declarations: [
    DropsSaleComponent,
    NftPreviewComponent,
    CheckoutPanelComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    FormsModule,
    SharedModule,
    ProgressSpinnerModule,
  ],
})
export class DropsSaleModule {}
