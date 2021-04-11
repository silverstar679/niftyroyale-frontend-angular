import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

const NFT_CONTRACT_ADDRESS = '0x7837A51763143eF1b558b32Ac8c9e7eb5DAfc155';

@Injectable()
export class OpenSeaService {
  private baseUrl = 'https://rinkeby-api.opensea.io/api/v1';

  constructor(private http: HttpClient) {}

  getAssets(): Promise<any[]> {
    const url = `${this.baseUrl}/assets?asset_contract_address=${NFT_CONTRACT_ADDRESS}`;
    return this.http
      .get<{ assets: any[] }>(url)
      .pipe(map(({ assets }) => assets))
      .toPromise();
  }
}
