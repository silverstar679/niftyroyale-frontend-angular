import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DropsSaleComponent } from './drops-sale.component';

const ROUTES: Routes = [{ path: '', component: DropsSaleComponent }];

@NgModule({
  declarations: [DropsSaleComponent],
  imports: [CommonModule, RouterModule.forChild(ROUTES)],
})
export class DropsSaleModule {}
