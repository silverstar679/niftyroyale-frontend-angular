import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenSeaAsset } from '../../models/opensea.types';
import { IpfsMetadataModel } from '../../models/nifty-royale.models';
import { environment } from '../../environments/environment';

const { openSeaAPI } = environment;

@Injectable()
export class OpenSeaService {
  constructor(private http: HttpClient) {}

  getAssets(address: string): Observable<OpenSeaAsset[]> {
    const url = `${openSeaAPI}/assets?asset_contract_address=${address}`;
    return this.http
      .get<{ assets: OpenSeaAsset[] }>(url)
      .pipe(map(({ assets }) => assets));
  }

  getAssetMetadata(uri: string): Observable<IpfsMetadataModel> {
    return this.http.get<IpfsMetadataModel>(uri);
  }
}
