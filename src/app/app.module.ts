import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NftCardComponent } from './nft-card/nft-card.component';
import { EthereumService } from './services/ethereum.service';

@NgModule({
  declarations: [AppComponent, NftCardComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [EthereumService],
  bootstrap: [AppComponent],
})
export class AppModule {}
