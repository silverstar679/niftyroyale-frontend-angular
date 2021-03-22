import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NftDetailsComponent } from './nft-details/nft-details.component';
import { NftListComponent } from './nft-list/nft-list.component';

const routes: Routes = [
  { path: '', component: NftListComponent },
  { path: ':id', component: NftDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
