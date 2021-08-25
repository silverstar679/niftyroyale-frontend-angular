import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { ContractService } from '../../services/contract.service';

@Injectable({ providedIn: 'root' })
export class BattleStatusResolver implements Resolve<any> {
  constructor(private contractService: ContractService) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    const contractAddress = route.paramMap.get('contractAddress');
    if (!contractAddress) {
      throw Error('Contract address is not defined in the URL');
    }
    await this.contractService.init(contractAddress);
    const totalPlayers = await this.contractService.getTotalPlayers();
    return { totalPlayers: Number(totalPlayers) };
  }
}
