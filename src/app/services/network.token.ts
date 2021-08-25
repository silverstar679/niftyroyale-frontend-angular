import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';
import { EthereumNetwork } from '../../models/nifty-royale.models';

enum CHAIN_ID_NETWORK {
  '0x1' = EthereumNetwork.MAINNET,
  '0x4' = EthereumNetwork.RINKEBY,
  '0x2a' = EthereumNetwork.KOVAN,
}

export const NETWORK = new InjectionToken<EthereumNetwork>('ETHEREUM NETWORK', {
  providedIn: 'root',
  factory: () => {
    const { location } = inject(DOCUMENT);

    if (!location) {
      throw new Error('Location is not available');
    }

    const subdomain = location.hostname.split('.')[0];
    const network = subdomain.split('-').reverse()[0];

    if ('localhost' === network) {
      return EthereumNetwork.MAINNET;
    }

    if ('app' === network) {
      return EthereumNetwork.MAINNET;
    }

    return network as EthereumNetwork;
  },
});
