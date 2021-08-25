import { Inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { NETWORK } from '../network.token';
import { ApiService } from '../api.service';
import { EthereumNetwork } from '../../../models/nifty-royale.models';

@Injectable({ providedIn: 'root' })
export class DropsListResolver implements Resolve<any> {
  constructor(
    private apiService: ApiService,
    @Inject(NETWORK) private network: EthereumNetwork
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    const { data } = await this.apiService.getDropsList();
    const drops = data.filter(
      (d: any) => d.network.toLowerCase() === this.network
    );
    const activeDrops = [];
    const pastDrops = [];
    for (const drop of drops) {
      if (drop.has_ended) {
        pastDrops.push(drop);
      } else {
        activeDrops.push(drop);
      }
    }
    return { activeDrops, pastDrops };
  }
}
