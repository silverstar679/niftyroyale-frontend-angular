import { MessageService } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { OpenSeaService } from '../../services/open-sea.service';
import { MetamaskService } from '../../services/metamask.service';
import { OpenSeaAsset } from '../../../models/opensea.types';
import {
  BattleState,
  NiftyAssetModel,
} from '../../../models/nifty-royale.models';
import { SEVERITY, SUMMARY } from '../../../models/toast.enum';

@Component({
  selector: 'app-battle-status',
  templateUrl: './battle-status.component.html',
})
export class BattleStatusComponent implements OnInit {
  battleStates = BattleState;
  displayedAssets = [] as NiftyAssetModel[];
  openseaAssets: { [tokenId: string]: OpenSeaAsset } = {};
  ownerAddresses: { [tokenId: string]: string } = {};
  contractAddress = '';
  dropName = '';
  defaultNftName = '';
  defaultPicture = '';
  winnerNftName = '';
  winnerPicture = '';
  currBattleState = '';
  inPlayPlayers = [] as string[];
  eliminatedPlayers = [] as string[];
  totalPlayers = 0;
  countdownTimer = '';
  isLoading = true;

  constructor(
    private contractService: ContractService,
    private metamaskService: MetamaskService,
    private openSeaService: OpenSeaService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {}

  get battleStatusText(): string {
    if (this.currBattleState === BattleState.STANDBY) {
      return 'Battle will start soon!';
    }
    if (this.currBattleState === BattleState.RUNNING) {
      return 'Next elimination:';
    }
    if (this.currBattleState === BattleState.ENDED) {
      return 'Battle has ended!';
    }
    return '';
  }

  get isBattleEnded(): boolean {
    return (
      this.currBattleState === BattleState.ENDED &&
      1 === this.inPlayPlayers.length
    );
  }

  async ngOnInit(): Promise<void> {
    try {
      this.contractAddress = this.route.snapshot.params.contractAddress;
      await this.contractService.init(this.contractAddress);
      await this.initBattleData();
      await Promise.all([
        this.getOwnerAddresses(this.totalPlayers),
        this.getOpenseaAssets(this.totalPlayers),
      ]);
      this.displayedAssets = this.getDisplayedAssets(this.totalPlayers);
      this.isLoading = false;
    } catch (error) {
      this.messageService.add({
        severity: SEVERITY.ERROR,
        summary: SUMMARY.ERROR_OCCURRED,
        detail: error.message,
        sticky: true,
      });
    }
  }

  private getDisplayedAssets(totalAssets: number): NiftyAssetModel[] {
    const displayedAssets = [] as NiftyAssetModel[];

    for (let i = 1; i <= totalAssets; i++) {
      const tokenId = `${i}`;
      const openseaAsset = this.openseaAssets[tokenId] || {};
      const ownerAddress = this.ownerAddresses[tokenId];
      const outOfPlayIndex = this.eliminatedPlayers.indexOf(tokenId);
      const isEliminated = outOfPlayIndex !== -1;
      const isWinner = this.isBattleEnded && tokenId === this.inPlayPlayers[0];
      let placement = 0;
      if (isWinner) {
        placement = 1;
      } else if (isEliminated) {
        placement = totalAssets - outOfPlayIndex;
      }
      displayedAssets.push({
        ...openseaAsset,
        tokenId,
        isEliminated,
        ownerAddress,
        placement,
        isOwner: this.metamaskService.isOwnerAddress(ownerAddress),
        name: placement === 1 ? this.winnerNftName : this.defaultNftName,
        nftURL: placement === 1 ? this.winnerPicture : this.defaultPicture,
      } as NiftyAssetModel);
    }

    return displayedAssets.sort((a, b) => {
      return (
        Number(b.isOwner) - Number(a.isOwner) ||
        Number(a.isEliminated) - Number(b.isEliminated) ||
        Number(a.placement) - Number(b.placement)
      );
    });
  }

  private async getOpenseaAssets(totalAssets: number): Promise<any> {
    const itemsPerPage = 50;
    const numberOfPages = Math.floor(totalAssets / itemsPerPage) + 1;
    const assets = await this.openSeaService
      .getAssets(this.contractAddress, numberOfPages, itemsPerPage)
      .toPromise();
    for (const asset of assets) {
      this.openseaAssets[asset.token_id] = asset;
    }
  }

  private async getOwnerAddresses(totalPlayers: number): Promise<void> {
    const ownerAddresses = await this.contractService
      .getOwnerAddresses(totalPlayers)
      .toPromise();
    for (let i = 0; i < ownerAddresses.length; i++) {
      this.ownerAddresses[`${i + 1}`] = ownerAddresses[i].toLowerCase();
    }
  }

  private async initBattleData(): Promise<void> {
    const {
      defaultURI,
      name,
      battleState,
      inPlayPlayers,
      eliminatedPlayers,
      nextEliminationTimestamp,
    } = await this.contractService.getBattleData();

    const defaultIpfsMetadata = await this.openSeaService
      .getAssetMetadata(defaultURI)
      .toPromise();

    this.dropName = name;
    this.defaultNftName = defaultIpfsMetadata.name;
    this.defaultPicture = defaultIpfsMetadata.image;
    this.currBattleState = battleState;
    this.eliminatedPlayers = eliminatedPlayers;
    this.inPlayPlayers = inPlayPlayers;
    this.totalPlayers = inPlayPlayers.length + eliminatedPlayers.length;

    if (this.isBattleEnded) {
      const winnerTokenId = this.inPlayPlayers[0];
      const winnerURI = await this.contractService.getTokenURI(winnerTokenId);
      const winnerIpfsMetadata = await this.openSeaService
        .getAssetMetadata(winnerURI)
        .toPromise();
      this.winnerNftName = winnerIpfsMetadata.name;
      this.winnerPicture = winnerIpfsMetadata.image;
    }

    this.initCountdown(nextEliminationTimestamp);
  }

  private initCountdown(nextEliminationTimestamp: number): void {
    const x = setInterval(() => {
      // Get today's date and time
      const now = new Date().getTime();

      // Find the distance between now and the count down date
      const distance = nextEliminationTimestamp - now;

      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.countdownTimer = '';

      if (days > 0) {
        if (`${days}`.length === 1) {
          this.countdownTimer = this.countdownTimer + '0';
        }
        this.countdownTimer = this.countdownTimer + days + ':';
        if (hours === 0) {
          this.countdownTimer = this.countdownTimer + '00';
        }
      }

      if (hours > 0) {
        if (`${hours}`.length === 1) {
          this.countdownTimer = this.countdownTimer + '0';
        }
        this.countdownTimer = this.countdownTimer + hours + ':';
        if (minutes === 0) {
          this.countdownTimer = this.countdownTimer + '00';
        }
      }

      if (minutes > 0) {
        if (`${minutes}`.length === 1) {
          this.countdownTimer = this.countdownTimer + '0';
        }
        this.countdownTimer = this.countdownTimer + minutes + ':';
        if (seconds === 0) {
          this.countdownTimer = this.countdownTimer + '00';
        }
      }

      if (seconds > 0) {
        if (`${seconds}`.length === 1) {
          this.countdownTimer = this.countdownTimer + '0';
        }
        this.countdownTimer = this.countdownTimer + seconds;
      }

      if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
        clearInterval(x);
        this.countdownTimer = 'Now!';
      }
    }, 1000);
  }
}
