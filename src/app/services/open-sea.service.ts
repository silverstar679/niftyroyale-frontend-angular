import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NETWORK } from './network.token';
import { OpenSeaAsset } from '../../models/opensea.types';
import { IpfsMetadataModel } from '../../models/nifty-royale.models';

@Injectable()
export class OpenSeaService {
  private readonly openseaBaseAPI: string;

  constructor(@Inject(NETWORK) private network: any, private http: HttpClient) {
    this.openseaBaseAPI = `https://api.niftyroyale.com/opensea/${network}`;
  }

  getAssets(address: string): Observable<OpenSeaAsset[]> {
    const url = `${this.openseaBaseAPI}/assets/${address}`;
    return this.http
      .get<{ assets: OpenSeaAsset[] }>(url)
      .pipe(map(({ assets }) => assets));
  }

  getAssetMetadata(uri: string): Observable<IpfsMetadataModel> {
    return this.http.get<IpfsMetadataModel>(uri);
  }
}
