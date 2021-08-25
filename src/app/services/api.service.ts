import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderJSON } from '../../models/opensea.types';
import {
  EthereumNetwork,
  IpfsMetadataModel,
  NiftyAssetModel,
  NiftyOrderModel,
} from '../../models/nifty-royale.models';
import { NETWORK } from './network.token';
import { PlayersService } from './players.service';

@Injectable()
export class ApiService {
  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private playersService: PlayersService,
    private http: HttpClient
  ) {}

  async getOrders(address: string, total: number): Promise<void> {
    if (!total || this.network === EthereumNetwork.KOVAN) {
      return;
    }
    const url = `https://api.niftyroyale.com/opensea/orders?address=${address}&network=${this.network}&total=${total}`;
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

  getDropsList(): Promise<any> {
    const url =
      'https://kuq79fsed0.execute-api.us-east-1.amazonaws.com/dev/v1/nft';
    return this.http.get<any[]>(url).toPromise();
  }
}
