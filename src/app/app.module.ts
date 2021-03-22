import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NftCardComponent } from './components/nft-card/nft-card.component';
import { EthereumService } from './services/ethereum.service';
import { OpenSeaService } from './services/open-sea.service';
import { NftDetailsComponent } from './nft-details/nft-details.component';
import { NftListComponent } from './nft-list/nft-list.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { PropertyCardComponent } from './components/property-card/property-card.component';

@NgModule({
  declarations: [
    AppComponent,
    NftCardComponent,
    NftListComponent,
    NftDetailsComponent,
    ProgressBarComponent,
    PropertyCardComponent,
  ],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  providers: [EthereumService, OpenSeaService],
  bootstrap: [AppComponent],
})
export class AppModule {}
