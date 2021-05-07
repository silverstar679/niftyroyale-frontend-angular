import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BattlesComponent } from './battles.component';

const ROUTES: Routes = [
  {
    path: 'battles',
    component: BattlesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list',
      },
      {
        path: 'list',
        loadChildren: () =>
          import('./battles-list/battles-list.module').then(
            (m) => m.BattlesListModule
          ),
      },
      {
        path: 'status/:contractAddress',
        loadChildren: () =>
          import('./battle-status/battle-status.module').then(
            (m) => m.BattleStatusModule
          ),
      },
    ],
  },
];

@NgModule({
  declarations: [BattlesComponent],
  imports: [CommonModule, RouterModule.forChild(ROUTES)],
})
export class BattlesModule {}
