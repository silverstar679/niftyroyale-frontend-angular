import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NftCardComponent } from './components/nft-card/nft-card.component';
import { NftDisplayerComponent } from './components/nft-displayer/nft-displayer.component';

@NgModule({
  declarations: [NftCardComponent, NftDisplayerComponent],
  imports: [CommonModule],
  exports: [NftCardComponent, NftDisplayerComponent],
})
export class SharedModule {}
