import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class OpenSeaService {
  private baseUrl = 'https://rinkeby-api.opensea.io/api/v1';
  private contractAddress = '0x82CA85A881169DaE80377c3D205d16A1f8C86A48';

  constructor(private http: HttpClient) {}

  getAssets(): Observable<any[]> {
    const url = `${this.baseUrl}/assets?asset_contract_address=${this.contractAddress}`;
    return this.http
      .get<{ assets: any[] }>(url)
      .pipe(map(({ assets }) => assets));
  }

  getAssetById(tokenId: string): Observable<any> {
    const url = `${this.baseUrl}/asset/${this.contractAddress}/${tokenId}`;
    return this.http.get<any>(url);
  }
}
