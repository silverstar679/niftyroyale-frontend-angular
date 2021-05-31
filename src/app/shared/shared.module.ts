import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NftCardComponent } from './components/nft-card/nft-card.component';
import { NftDisplayerComponent } from './components/nft-displayer/nft-displayer.component';
import { SpinnerComponent } from './components/spinner/spinner.component';

@NgModule({
  declarations: [NftCardComponent, NftDisplayerComponent, SpinnerComponent],
  imports: [CommonModule],
  exports: [NftCardComponent, NftDisplayerComponent, SpinnerComponent],
})
export class SharedModule {}
