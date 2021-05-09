import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StoreComponent } from './store.component';

const ROUTES: Routes = [
  { path: 'store/:contractAddress/:tokenId', component: StoreComponent },
];

@NgModule({
  declarations: [StoreComponent],
  imports: [CommonModule, RouterModule.forChild(ROUTES)],
})
export class StoreModule {}
