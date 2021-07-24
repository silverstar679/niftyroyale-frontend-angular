import { MessageService } from 'primeng/api';
import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
  flipOnEnterAnimation,
  slideInRightOnEnterAnimation,
} from 'angular-animations';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NETWORK } from '../../services/network.token';
import { MetamaskService } from '../../services/metamask.service';
import { ContractService } from '../../services/contract.service';
import { OpenSeaService } from '../../services/open-sea.service';
import { PlayersService } from '../../services/players.service';
import {
  BattleState,
  EthereumNetwork,
  NiftyAssetModel,
} from '../../../models/nifty-royale.models';

enum Events {
  ELIMINATED = 'Eliminated',
}

enum FilterOptions {
  ALL = 'all',
  OWNER = 'owner',
  STILL_IN_PLAY = 'still-in-play',
  ELIMINATED = 'eliminated',
  FOR_SALE = 'for-sale',
  WITH_OFFERS = 'with-offers',
}

@Component({
  selector: 'app-battle-status',
  templateUrl: './battle-status.component.html',
  animations: [
    fadeInOnEnterAnimation(),
    fadeOutOnLeaveAnimation(),
    flipOnEnterAnimation(),
    slideInRightOnEnterAnimation(),
  ],
})
export class BattleStatusComponent implements OnInit, OnDestroy {
  private readonly selectedFilterSubject = new BehaviorSubject<FilterOptions>(
    FilterOptions.ALL
  );
  filteredPlayers$: Observable<NiftyAssetModel[]>;
  filterOptions = [
    {
      label: 'All NFTs',
      value: null,
    },
    {
      label: 'NFTs Owned',
      value: FilterOptions.OWNER,
    },
    {
      label: 'NFTs Still in Battle',
      value: FilterOptions.STILL_IN_PLAY,
    },
    {
      label: 'NFTs Eliminated',
      value: FilterOptions.ELIMINATED,
    },
    {
      label: 'NFTs For Sale',
      value: FilterOptions.FOR_SALE,
    },
    {
      label: 'NFTs With Offers',
      value: FilterOptions.WITH_OFFERS,
    },
  ];
  battleStates = BattleState;
  contractAddress = '';
  dropName = '';
  defaultNftName = '';
  defaultPicture = '';
  winnerNftName = '';
  winnerPicture = '';
  currBattleState = -1;
  totalPlayers = 0;
  totalInPlay = 0;
  totalEliminated = 0;
  nextEliminationTimestamp = 0;
  lastTokenIdEliminated = '';
  displayDialog = false;
  displayNextEliminationLoader = false;
  displayEliminationScreen = false;
  imgDialog = '';
  isLoading = true;
  eliminationScreenTimeout: any;

  constructor(
    @Inject(NETWORK) private network: EthereumNetwork,
    private contractService: ContractService,
    private metamaskService: MetamaskService,
    private playersService: PlayersService,
    private openSeaService: OpenSeaService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.filteredPlayers$ = this.getFilteredPlayers();
  }

  async ngOnInit(): Promise<void> {
    this.contractAddress = this.route.snapshot.params.contractAddress;
    await this.contractService.init(this.contractAddress);
    this.totalPlayers = Number(await this.contractService.getTotalPlayers());
    this.isLoading = false;
    await this.loadBattleData();
    this.listenEliminatedEvents();
  }

  get battleStatusTXT(): string {
    if (this.currBattleState === BattleState.STANDBY) {
      return 'Battle will start soon!';
    }
    if (this.currBattleState === BattleState.RUNNING) {
      return 'Next elimination:';
    }
    if (this.currBattleState === BattleState.ENDED) {
      return 'Battle has ended!';
    }
    return 'Loading...';
  }

  get dropNameTXT(): string {
    return this.dropName ? this.dropName : 'Loading...';
  }

  get remainingPlayersTXT(): string {
    return this.totalPlayers && this.totalPlayers
      ? `${this.totalInPlay}/${this.totalPlayers} NFTs remain`
      : 'Loading...';
  }

  get isKovanNetwork(): boolean {
    return this.network === EthereumNetwork.KOVAN;
  }

  async closeNextEliminationScreen(): Promise<void> {
    clearTimeout(this.eliminationScreenTimeout);
    this.totalInPlay = this.totalInPlay - 1;
    this.totalEliminated = this.totalEliminated + 1;
    this.displayNextEliminationLoader = false;
    this.displayEliminationScreen = false;
    this.lastTokenIdEliminated = '';
    if (this.totalInPlay === 1) {
      this.currBattleState = BattleState.ENDED;
      await this.contractService.getInPlayPlayers();
    } else {
      await this.getTimestamp();
    }
    return this.cdr.detectChanges();
  }

  playerData$(tokenId: string): Observable<NiftyAssetModel> {
    return this.playersService.select(tokenId);
  }

  openOpenseaTab(address: string, tokenId: string): void {
    const openSeaNetwork =
      EthereumNetwork.MAINNET !== this.network ? 'testnets.' : '';
    const openSeaURL = `https://${openSeaNetwork}opensea.io/assets/${address}/${tokenId}`;
    window.open(openSeaURL);
  }

  setFilterOption(filter: FilterOptions): void {
    this.selectedFilterSubject.next(filter);
  }

  showImageDialog(url: string): void {
    this.imgDialog = url;
    this.displayDialog = true;
  }

  showNextEliminationLoader(): void {
    this.displayNextEliminationLoader = true;
    this.cdr.detectChanges();
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

    const orders = this.openSeaService.getOrders(
      this.contractAddress,
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
          this.openSeaService.getAssetMetadata(defaultURI),
          this.openSeaService.getAssetMetadata(winnerURI),
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
      this.displayNextEliminationLoader = t - now <= 0;
      this.nextEliminationTimestamp = t;
    }) as Promise<number>;
  }

  private listenEliminatedEvents(): void {
    this.contractService.contract.events.allEvents((error: any, res: any) => {
      if (res.event === Events.ELIMINATED) {
        const { _tokenID } = res.returnValues;
        this.displayEliminationScreen = true;
        this.lastTokenIdEliminated = _tokenID;
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
            return players.filter((p) => Boolean(p.order.sell));
          case FilterOptions.WITH_OFFERS:
            return players.filter((p) => Boolean(p.order.buy));
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
  }
}
