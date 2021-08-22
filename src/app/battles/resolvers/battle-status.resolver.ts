import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { CONTRACTS_CONFIG } from '../../../constants/contracts';

@Injectable({ providedIn: 'root' })
export class BattleStatusResolver implements Resolve<any> {
  constructor(
    private contractService: ContractService,
    private http: HttpClient
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    const contractAddress = route.paramMap.get('contractAddress');
    if (!contractAddress) {
      throw Error('Contract address is not defined in the URL');
    }
    await this.contractService.init(contractAddress);
    const configFileName = CONTRACTS_CONFIG[contractAddress];
    const [totalPlayers, stylesConfig] = await Promise.all([
      this.contractService.getTotalPlayers(),
      this.getStylesConfigJSON(configFileName),
    ]);
    return { totalPlayers: Number(totalPlayers), ...stylesConfig };
  }

  private getStylesConfigJSON(configFileName: string): Promise<any> {
    return this.http.get(`assets/config/${configFileName}`).toPromise();
  }
}
