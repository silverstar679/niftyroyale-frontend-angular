import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { MetamaskService } from './services/metamask.service';
import { OpenSeaService } from './services/open-sea.service';
import { ContractService } from './services/contract.service';
import { DropsModule } from './drops/drops.module';
import { BattlesModule } from './battles/battles.module';
import { AppComponent } from './app.component';

const ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'battles/list' },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES),
    ToastModule,
    DropsModule,
    BattlesModule,
  ],
  providers: [MetamaskService, OpenSeaService, ContractService, MessageService],
  bootstrap: [AppComponent],
})
export class AppModule {}
