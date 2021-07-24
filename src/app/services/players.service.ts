import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { NiftyAssetModel } from '../../models/nifty-royale.models';

interface Players {
  [tokenId: string]: NiftyAssetModel;
}

@Injectable()
export class PlayersService {
  private readonly players = new BehaviorSubject<Players>({});
  public players$ = this.players.asObservable();

  get playersState(): Players {
    return this.players.getValue();
  }

  select(tokenId: string): Observable<NiftyAssetModel> {
    return this.players$.pipe(
      map((players) => players[tokenId]),
      take(1)
    );
  }

  merge(tokenId: string, player: NiftyAssetModel): void {
    const currValue = this.playersState[tokenId] || {};
    const newValue = { ...currValue, ...player };
    this.players.next({ ...this.playersState, [tokenId]: newValue });
  }

  reset(): void {
    this.players.next({});
  }
}
