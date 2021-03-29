import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { EthereumService } from './services/ethereum.service';
import { OpenSeaService } from './services/open-sea.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [EthereumService, OpenSeaService],
  bootstrap: [AppComponent],
})
export class AppModule {}
