import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  defer,
  Observable,
  Subscription,
} from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ContractService } from '../../services/contract.service';
import { ApiService } from '../../services/api.service';
import { PlayersService } from '../../services/players.service';
import {
  BattleState,
  NiftyAssetModel,
} from '../../../models/nifty-royale.models';
import { FilterOptions } from './filters/filters.component';

enum Events {
  ELIMINATED = 'Eliminated',
}

@Component({
  selector: 'app-battle-status',
  templateUrl: './battle-status.component.html',
})
export class BattleStatusComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  private eliminationScreenTimeout: any;
  private readonly selectedFilterSubject = new BehaviorSubject<FilterOptions>(
    FilterOptions.ALL
  );
  currBattleState!: number;
  filteredPlayers$: Observable<NiftyAssetModel[]>;
  battleStates = BattleState;
  dropName = '';
  defaultNftName = '';
  defaultPicture = '';
  winnerNftName = '';
  winnerPicture = '';
  totalPlayers = 0;
  totalInPlay = 0;
  totalEliminated = 0;
  nextEliminationTimestamp = 0;
  imgDialog = '';
  tokenIdEliminated = '';
  displayDialog = false;
  displayEliminationScreen = false;
  isEliminationTriggered = false;

  constructor(
    private apiService: ApiService,
    private contractService: ContractService,
    private playersService: PlayersService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.filteredPlayers$ = this.getFilteredPlayers();
  }

  async ngOnInit(): Promise<void> {
    this.listenEliminatedEvents();
    this.subscription = this.route.data
      .pipe(
        mergeMap(({ data }) => {
          this.totalPlayers = data.totalPlayers;
          return defer(() => this.loadBattleData());
        })
      )
      .subscribe();
  }

  async closeNextEliminationScreen(): Promise<void> {
    clearTimeout(this.eliminationScreenTimeout);
    this.totalInPlay = this.totalInPlay - 1;
    this.totalEliminated = this.totalEliminated + 1;
    this.isEliminationTriggered = false;
    this.displayEliminationScreen = false;
    this.tokenIdEliminated = '';
    if (this.totalInPlay === 1) {
      this.currBattleState = BattleState.ENDED;
      await this.contractService.getInPlayPlayers();
    } else {
      await this.getTimestamp();
    }
    return this.cdr.detectChanges();
  }

  getNFTName(placement: number): string {
    return placement === 1 ? this.winnerNftName : this.defaultNftName;
  }

  getNFTPicture(placement: number): string {
    return placement === 1 ? this.winnerPicture : this.defaultPicture;
  }

  displayImageDialog(url: string): void {
    this.imgDialog = url;
    this.displayDialog = true;
  }

  setFilterOption(filter: FilterOptions): void {
    this.selectedFilterSubject.next(filter);
  }

  private async loadBattleData(): Promise<any> {
    const inPlayPlayers = this.contractService
      .getInPlayPlayers()
      .then((players) => (this.totalInPlay = players.length));

    const eliminatedPlayers = this.contractService
      .getEliminatedPlayers(this.totalPlayers)
      .then((players) => (this.totalEliminated = players.length));

    const ownerAddresses = this.contractService.getOwnerAddresses(
      this.totalPlayers
    );

    const orders = this.apiService.getOrders(
      this.route.snapshot.params.contractAddress,
      this.totalPlayers
    );

    const battleName = this.contractService
      .getBattleName()
      .then((dropName) => (this.dropName = dropName));

    const battleState = this.contractService
      .getBattleState()
      .then((state) => (this.currBattleState = Number(state)));

    const timestamp = this.getTimestamp();

    const ipfsMetadata = this.contractService
      .getTokenURIs()
      .then(({ defaultURI, winnerURI }) => {
        return Promise.all([
          this.apiService.getAssetMetadata(defaultURI),
          this.apiService.getAssetMetadata(winnerURI),
        ]);
      })
      .then(([defaultIpfsMetadata, winnerIpfsMetadata]) => {
        this.defaultNftName = defaultIpfsMetadata.name;
        this.defaultPicture = defaultIpfsMetadata.image;
        this.winnerNftName = winnerIpfsMetadata.name;
        this.winnerPicture = winnerIpfsMetadata.image;
      });

    return Promise.all([
      ipfsMetadata,
      inPlayPlayers,
      eliminatedPlayers,
      ownerAddresses,
      orders,
      battleName,
      battleState,
      timestamp,
    ]);
  }

  private getTimestamp(): Promise<number> {
    return this.contractService.getNextEliminationTimestamp().then((t) => {
      const now = new Date().getTime();
      this.isEliminationTriggered = t - now <= 0;
      this.nextEliminationTimestamp = t;
    }) as Promise<number>;
  }

  private listenEliminatedEvents(): void {
    this.contractService.contract.events.allEvents((error: any, res: any) => {
      if (res.event === Events.ELIMINATED) {
        const { _tokenID } = res.returnValues;
        this.displayEliminationScreen = true;
        this.tokenIdEliminated = _tokenID;
        this.playersService.merge(_tokenID, {
          isEliminated: true,
          placement: this.totalInPlay,
        } as NiftyAssetModel);
        this.eliminationScreenTimeout = setTimeout(
          () => this.closeNextEliminationScreen(),
          30 * 1000
        );
        return this.cdr.detectChanges();
      }
    });
  }

  private getFilteredPlayers(): Observable<NiftyAssetModel[]> {
    const playerDataArr$ = this.playersService.players$.pipe(
      map((players) => Object.keys(players).map((tokenId) => players[tokenId]))
    );

    return combineLatest([playerDataArr$, this.selectedFilterSubject]).pipe(
      map(([players, filter]) => {
        switch (filter) {
          case FilterOptions.OWNER:
            return players.filter((p) => p.isOwner);
          case FilterOptions.STILL_IN_PLAY:
            return players.filter((p) => !p.isEliminated);
          case FilterOptions.ELIMINATED:
            return players.filter((p) => p.isEliminated);
          case FilterOptions.FOR_SALE:
            return players.filter((p) => Boolean(p.order?.sell));
          case FilterOptions.WITH_OFFERS:
            return players.filter((p) => Boolean(p.order?.buy));
          default:
            return players;
        }
      }),
      map((players) => {
        return players.sort((a, b) => {
          return (
            Number(b.isOwner) - Number(a.isOwner) ||
            Number(a.isEliminated) - Number(b.isEliminated) ||
            Number(a.placement) - Number(b.placement) ||
            Number(a.tokenId) - Number(b.tokenId)
          );
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.playersService.reset();
    this.subscription.unsubscribe();
  }
}
