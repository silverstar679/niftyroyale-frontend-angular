import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, Subscription } from 'rxjs';
import { mergeMap, switchMap, tap } from 'rxjs/operators';
import { OpenSeaService } from '../services/open-sea.service';

@Component({
  selector: 'app-nft-details',
  templateUrl: './nft-details.component.html',
  styleUrls: ['./nft-details.component.scss'],
})
export class NftDetailsComponent implements OnInit, OnDestroy {
  asset: any;
  properties: any[] = [];
  stats: any[] = [];
  private subscriptions = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private openSeaService: OpenSeaService
  ) {}

  ngOnInit(): void {
    this.subscriptions = this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => this.openSeaService.getAssetById(id)),
        tap((asset) => (this.asset = asset)),
        mergeMap(({ traits }) =>
          from(traits).pipe(
            tap((trait: any) => {
              switch (trait.display_type) {
                case 'number':
                  this.stats.push(trait);
                  break;
                case 'boost_number':
                  this.stats.push(trait);
                  break;
                case 'boost_percentage':
                  this.stats.push(trait);
                  break;
                case null:
                  this.properties.push(trait);
                  break;
              }
            })
          )
        )
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
