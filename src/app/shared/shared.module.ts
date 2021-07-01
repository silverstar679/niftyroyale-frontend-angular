import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NftCardComponent } from './components/nft-card/nft-card.component';
import { NftDisplayerComponent } from './components/nft-displayer/nft-displayer.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { CountdownComponent } from './components/countdown/countdown.component';

@NgModule({
  declarations: [
    NftCardComponent,
    NftDisplayerComponent,
    SpinnerComponent,
    CountdownComponent,
  ],
  imports: [CommonModule],
  exports: [
    NftCardComponent,
    NftDisplayerComponent,
    SpinnerComponent,
    CountdownComponent,
  ],
})
export class SharedModule {}
