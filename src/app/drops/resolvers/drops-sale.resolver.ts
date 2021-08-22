import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { CONTRACTS_CONFIG } from '../../../constants/contracts';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DropsSaleResolver implements Resolve<any> {
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
    const [dropData, stylesConfig] = await Promise.all([
      this.contractService.getDropData(),
      this.getStylesConfigJSON(configFileName),
    ]);
    return { ...dropData, ...stylesConfig };
  }

  private getStylesConfigJSON(configFileName: string): Promise<any> {
    return this.http.get(`assets/config/${configFileName}`).toPromise();
  }
}
