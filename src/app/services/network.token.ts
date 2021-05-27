import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';

export const NETWORK = new InjectionToken<any>('ETHEREUM NETWORK', {
  providedIn: 'root',
  factory: () => {
    const { location } = inject(DOCUMENT);

    if (!location) {
      throw new Error('Location is not available');
    }

    const network = location.hostname.split('.')[0];

    return 'app' === network ? 'mainnet' : 'rinkeby';
  },
});
