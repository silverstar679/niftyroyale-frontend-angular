import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CurrencyEnum } from '../models/bot.model';

@Injectable()
export class OpenSeaService {
  private baseUrl = 'https://rinkeby-api.opensea.io/api/v1';
  private contractAddress = '0x18dB7a9D61bC4364DFD139c3BeE46143d2F40aC5';

  constructor(private http: HttpClient) {}

  getAssets(): Observable<any[]> {
    const url = `${this.baseUrl}/assets?asset_contract_address=${this.contractAddress}`;
    return this.http.get<{ assets: any[] }>(url).pipe(
      map(({ assets }) => {
        return assets.map((asset: any) => {
          return {
            ...asset,
            price: 0.1,
            currency: CurrencyEnum.ETH,
          };
        });
      })
    );
  }

  getAssetById(tokenId: string): Observable<any> {
    const url = `${this.baseUrl}/asset/${this.contractAddress}/${tokenId}`;
    return this.http.get<any>(url);
  }
}
