import { MessageService } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { OpenSeaService } from '../../services/open-sea.service';
import { MetamaskService } from '../../services/metamask.service';
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
  assets = [] as NiftyAssetModel[];
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
      await this.getOwnerAddresses();
      this.assets = await this.getMintedAssets();
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

  private async getMintedAssets(): Promise<NiftyAssetModel[]> {
    const assets = await this.openSeaService
      .getAssets(this.contractAddress)
      .toPromise();

    return assets
      .map((a) => {
        const asset = {
          ...a,
          tokenId: a.token_id,
          isEliminated: false,
          isOwner: false,
          name: '',
          nftURL: '',
          ownerAddress: '',
          placement: 0,
        } as NiftyAssetModel;

        const outOfPlayIndex = this.eliminatedPlayers.indexOf(asset.tokenId);
        asset.isEliminated = outOfPlayIndex !== -1;
        asset.ownerAddress = this.ownerAddresses[asset.tokenId];
        asset.isOwner = this.metamaskService.isOwnerAddress(asset.ownerAddress);
        const isWinner =
          this.isBattleEnded && asset.tokenId === this.inPlayPlayers[0];
        if (isWinner) {
          asset.placement = 1;
        } else if (asset.isEliminated) {
          asset.placement = this.totalPlayers - outOfPlayIndex;
        }
        asset.name =
          asset.placement === 1 ? this.winnerNftName : this.defaultNftName;
        asset.nftURL =
          asset.placement === 1 ? this.winnerPicture : this.defaultPicture;
        return asset;
      })
      .sort((a, b) => {
        return (
          Number(b.isOwner) - Number(a.isOwner) ||
          Number(a.isEliminated) - Number(b.isEliminated) ||
          Number(a.tokenId) - Number(b.tokenId)
        );
      });
  }

  private async getOwnerAddresses(): Promise<void> {
    const promises = [];
    for (let i = 1; i <= this.totalPlayers; i++) {
      promises.push(this.contractService.getOwnerAddress(`${i}`));
    }
    const ownerAddresses = await Promise.all(promises);
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
