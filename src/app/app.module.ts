import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { MetamaskService } from './services/metamask.service';
import { OpenSeaService } from './services/open-sea.service';
import { ContractService } from './services/contract.service';
import { BattleListComponent } from './battle-list/battle-list.component';
import { BattleStatusComponent } from './battle-status/battle-status.component';
import { NftCardComponent } from './battle-status/nft-card/nft-card.component';
import { StoreComponent } from './store/store.component';
import { AppComponent } from './app.component';

const ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'battle-list',
  },
  {
    path: 'battle-list',
    component: BattleListComponent,
  },
  {
    path: 'battle-status/:contractAddress',
    component: BattleStatusComponent,
  },
  {
    path: 'store/:contractAddress/:tokenId',
    component: StoreComponent,
  },
];

@NgModule({
  declarations: [
    AppComponent,
    StoreComponent,
    BattleListComponent,
    BattleStatusComponent,
    NftCardComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES),
    ProgressSpinnerModule,
    ToastModule,
  ],
  providers: [MetamaskService, OpenSeaService, ContractService, MessageService],
  bootstrap: [AppComponent],
})
export class AppModule {}
