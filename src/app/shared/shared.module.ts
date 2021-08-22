import { CountdownModule } from 'ngx-countdown';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NftDisplayerComponent } from './nft-displayer/nft-displayer.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { CountdownComponent } from './countdown/countdown.component';
import { ListComponent } from './list/list.component';
import { ListItemComponent } from './list/list-item/list-item.component';

@NgModule({
  declarations: [
    NftDisplayerComponent,
    SpinnerComponent,
    CountdownComponent,
    ListComponent,
    ListItemComponent,
  ],
  imports: [CommonModule, CountdownModule],
  exports: [
    NftDisplayerComponent,
    SpinnerComponent,
    CountdownComponent,
    ListComponent,
    ListItemComponent,
  ],
})
export class SharedModule {}
