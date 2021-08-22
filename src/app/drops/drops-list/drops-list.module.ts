import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DropsListComponent } from './drops-list.component';

const ROUTES: Routes = [{ path: '', component: DropsListComponent }];

@NgModule({
  declarations: [DropsListComponent],
  imports: [CommonModule, RouterModule.forChild(ROUTES), SharedModule],
})
export class DropsListModule {}
