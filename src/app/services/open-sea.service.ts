import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, range } from 'rxjs';
import { map, mergeMap, scan, takeLast } from 'rxjs/operators';
import { OpenSeaAsset } from '../../models/opensea.types';
import {
  EthereumNetwork,
  IpfsMetadataModel,
} from '../../models/nifty-royale.models';
import { NETWORK } from './network.token';

@Injectable()
export class OpenSeaService {
  private readonly openseaBaseAPI: string;

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private http: HttpClient
  ) {
    this.openseaBaseAPI = `https://api.niftyroyale.com/opensea/${network}`;
  }

  getAssets(
    address: string,
    numberOfPages: number,
    itemsPerPage: number
  ): Observable<OpenSeaAsset[]> {
    return range(1, numberOfPages).pipe(
      mergeMap((pageNumber) => {
        const offset = (pageNumber - 1) * itemsPerPage;
        const url = `${this.openseaBaseAPI}/assets/${address}?offset=${offset}&limit=${itemsPerPage}`;
        return this.http
          .get<{ assets: OpenSeaAsset[] }>(url)
          .pipe(map(({ assets }) => assets));
      }),
      scan(
        (acc: OpenSeaAsset[], value: OpenSeaAsset[]) => [...acc, ...value],
        []
      ),
      takeLast(1)
    );
  }

  getAssetMetadata(uri: string): Observable<IpfsMetadataModel> {
    return this.http.get<IpfsMetadataModel>(uri);
  }
}
