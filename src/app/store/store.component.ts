import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NETWORK } from '../services/network.token';
import { EthereumNetwork } from '../../models/nifty-royale.models';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreComponent {
  openSeaURL$: Observable<SafeResourceUrl>;

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private location: Location,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    const openSeaNetwork =
      EthereumNetwork.MAINNET !== this.network ? 'testnets.' : '';
    const openSeaURL = `https://${openSeaNetwork}opensea.io/assets`;
    this.openSeaURL$ = this.route.params.pipe(
      map(({ contractAddress, tokenId }) => {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `${openSeaURL}/${contractAddress}/${tokenId}?embed=true`
        );
      })
    );
  }

  backToBattle(): void {
    this.location.back();
  }
}
