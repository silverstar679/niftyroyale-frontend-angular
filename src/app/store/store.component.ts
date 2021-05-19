import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const { openSeaURL } = environment;

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
})
export class StoreComponent {
  openSeaURL$: Observable<SafeResourceUrl>;

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private location: Location
  ) {
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
