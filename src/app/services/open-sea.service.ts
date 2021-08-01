import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, range } from 'rxjs';
import { map, mergeMap, scan, takeLast } from 'rxjs/operators';
import { OpenSeaAsset, OrderJSON } from '../../models/opensea.types';
import {
  EthereumNetwork,
  IpfsMetadataModel,
  NiftyOrderModel,
} from '../../models/nifty-royale.models';
import { NETWORK } from './network.token';

@Injectable()
export class OpenSeaService {
  public orders: { [tokenId: string]: NiftyOrderModel } = {};
  private readonly openseaBaseAPI: string;

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private http: HttpClient
  ) {
    this.openseaBaseAPI = 'https://api.niftyroyale.com/opensea';
  }

  getAssets(
    address: string,
    numberOfPages: number,
    itemsPerPage: number
  ): Observable<OpenSeaAsset[]> {
    return range(1, numberOfPages).pipe(
      mergeMap((pageNumber) => {
        const offset = (pageNumber - 1) * itemsPerPage;
        const url = `${this.openseaBaseAPI}/${this.network}/assets/${address}?offset=${offset}&limit=${itemsPerPage}`;
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

  getOrders(address: string, total: number): Observable<string[]> {
    if (!total || this.network === EthereumNetwork.KOVAN) {
      return of([]);
    }
    const url = `${this.openseaBaseAPI}/orders?address=${address}&network=${this.network}&total=${total}`;
    return this.http.get<OrderJSON[]>(url).pipe(
      map((orders) =>
        orders.map((order) => {
          const tokenId = order.asset.token_id;
          if (!this.orders[tokenId]) {
            this.orders[tokenId] = {};
          }
          if (0 === order.side) {
            this.orders[tokenId].buy = order;
          } else if (1 === order.side) {
            this.orders[tokenId].sell = order;
          }
          return tokenId;
        })
      )
    );
  }

  getAssetMetadata(uri: string): Observable<IpfsMetadataModel> {
    return this.http.get<IpfsMetadataModel>(uri);
  }
}
