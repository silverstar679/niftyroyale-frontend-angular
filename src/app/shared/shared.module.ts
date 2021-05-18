import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NftDisplayerComponent } from './components/nft-displayer/nft-displayer.component';

@NgModule({
  declarations: [NftDisplayerComponent],
  imports: [CommonModule],
  exports: [NftDisplayerComponent],
})
export class SharedModule {}
