import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenSeaService } from '../services/open-sea.service';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NftListComponent {
  assets$: Observable<any[]>;

  constructor(private openSeaService: OpenSeaService) {
    this.assets$ = this.openSeaService.getAssets().pipe(
      map((assets) => {
        return assets.map((asset) => ({ ...asset, sold: Math.random() > 0.5 }));
      })
    );
  }
}
