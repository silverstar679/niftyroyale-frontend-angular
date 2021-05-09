import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DropsComponent } from './drops.component';

const ROUTES: Routes = [
  {
    path: 'drops',
    component: DropsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list',
      },
      {
        path: 'list',
        loadChildren: () =>
          import('./drops-list/drops-list.module').then(
            (m) => m.DropsListModule
          ),
      },
      {
        path: 'sale/:contractAddress',
        loadChildren: () =>
          import('./drops-sale/drops-sale.module').then(
            (m) => m.DropsSaleModule
          ),
      },
    ],
  },
];

@NgModule({
  declarations: [DropsComponent],
  imports: [CommonModule, RouterModule.forChild(ROUTES)],
})
export class DropsModule {}
