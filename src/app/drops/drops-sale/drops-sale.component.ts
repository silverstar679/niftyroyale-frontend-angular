import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { defer, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { BattleState } from '../../../models/nifty-royale.models';

@Component({
  selector: 'app-drops-sale',
  templateUrl: './drops-sale.component.html',
})
export class DropsSaleComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  dropName = '';
  ethPrice = '';
  maxUnits = 0;
  maxMinted = 0;
  totalMinted = 0;
  defaultNftImage = '';
  winnerNftImage = '';
  nftDescription = '';
  artistDescription = '';
  isBattleStarted = false;

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.subscription = this.route.data
      .pipe(
        mergeMap(({ data }) => {
          const {
            defaultURI,
            winnerURI,
            name,
            ethPrice,
            maxUnits,
            maxMinted,
            totalMinted,
            battleState,
          } = data;

          this.dropName = name;
          this.maxMinted = maxMinted;
          this.totalMinted = totalMinted;
          this.ethPrice = ethPrice;
          this.isBattleStarted = battleState !== BattleState.STANDBY;
          this.maxUnits = maxUnits;

          return defer(() => this.fetchIPFSMetadata(defaultURI, winnerURI));
        })
      )
      .subscribe();
  }

  private async fetchIPFSMetadata(
    defaultURI: string,
    winnerURI: string
  ): Promise<void> {
    const [defaultIpfsMetadata, winnerIpfsMetadata] = await Promise.all([
      this.apiService.getAssetMetadata(defaultURI),
      this.apiService.getAssetMetadata(winnerURI),
    ]);

    this.artistDescription =
      defaultIpfsMetadata.attributes.find(
        (a) => -1 !== a.trait_type.indexOf('Artist Description')
      )?.value || '';
    this.nftDescription = defaultIpfsMetadata.description;
    this.defaultNftImage = defaultIpfsMetadata.image;
    this.winnerNftImage = winnerIpfsMetadata.image;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
