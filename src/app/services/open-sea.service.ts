import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, range } from 'rxjs';
import { map, mergeMap, scan, takeLast } from 'rxjs/operators';
import { OpenSeaAsset, OrderJSON } from '../../models/opensea.types';
import {
  EthereumNetwork,
  IpfsMetadataModel,
  NiftyAssetModel,
  NiftyOrderModel,
} from '../../models/nifty-royale.models';
import { PlayersService } from './players.service';
import { NETWORK } from './network.token';

@Injectable()
export class OpenSeaService {
  private readonly openseaBaseAPI: string;

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private playersService: PlayersService,
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

  async getOrders(address: string, total: number): Promise<void> {
    if (!total || this.network === EthereumNetwork.KOVAN) {
      return;
    }
    const url = `${this.openseaBaseAPI}/orders?address=${address}&network=${this.network}&total=${total}`;
    const orderBook = await this.http.get<OrderJSON[]>(url).toPromise();
    const orders = {} as { [tokenId: string]: NiftyOrderModel };
    for (let i = 1; i <= total; i++) {
      orders[i] = {
        buy: undefined,
        sell: undefined,
      };
    }
    for (const o of orderBook) {
      const tokenId = o.asset.token_id;
      if (0 === o.side) {
        orders[tokenId].buy = o;
      } else if (1 === o.side) {
        orders[tokenId].sell = o;
      }
    }
    for (let i = 1; i <= total; i++) {
      const tokenId = `${i}`;
      const order = orders[i];
      this.playersService.merge(tokenId, { order } as NiftyAssetModel);
    }
  }

  getAssetMetadata(uri: string): Promise<IpfsMetadataModel> {
    return this.http.get<IpfsMetadataModel>(uri).toPromise();
  }
}
