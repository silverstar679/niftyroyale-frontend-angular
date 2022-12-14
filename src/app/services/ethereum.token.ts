import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';

export const ETHEREUM = new InjectionToken<any>('ETHEREUM WINDOW OBJECT', {
  providedIn: 'root',
  factory: () => {
    const { defaultView } = inject(DOCUMENT);

    if (!defaultView) {
      throw new Error('Window is not available');
    }

    return (defaultView as any).ethereum;
  },
});
