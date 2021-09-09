import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { ApiService } from '../api.service';

@Injectable({ providedIn: 'root' })
export class DropsListResolver implements Resolve<any> {
  constructor(private apiService: ApiService) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    const drops = await this.apiService.getDropsList();
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
