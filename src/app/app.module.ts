import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { EthereumService } from './services/ethereum.service';
import { OpenSeaService } from './services/open-sea.service';
import { ContractService } from './services/contract.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [EthereumService, OpenSeaService, ContractService],
  bootstrap: [AppComponent],
})
export class AppModule {}
