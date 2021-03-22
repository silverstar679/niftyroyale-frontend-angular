import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
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
    this.assets$ = this.openSeaService.getAssets();
  }
}
