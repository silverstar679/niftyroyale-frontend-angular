import { MessageService } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ContractService } from '../../services/contract.service';
import { MetamaskService } from '../../services/metamask.service';
import { OpenSeaService } from '../../services/open-sea.service';
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
  dropName = '';
  defaultPicture = '';
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
    private sanitizer: DomSanitizer,
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

  async ngOnInit(): Promise<void> {
    try {
      const { contractAddress } = this.route.snapshot.params;
      await this.contractService.init(contractAddress);

      const {
        uri,
        name,
        battleState,
        inPlayPlayers,
        eliminatedPlayers,
        nextEliminationTimestamp,
      } = await this.contractService.getBattleData();

      this.initCountdown(nextEliminationTimestamp);

      const defaultIpfsMetadata = await this.openSeaService
        .getAssetMetadata(uri)
        .toPromise();

      this.dropName = name;
      this.defaultPicture = defaultIpfsMetadata.image;
      this.currBattleState = battleState;
      this.eliminatedPlayers = eliminatedPlayers;
      this.inPlayPlayers = inPlayPlayers;
      this.totalPlayers = inPlayPlayers.length + eliminatedPlayers.length;

      if (
        this.inPlayPlayers.length === 1 &&
        this.currBattleState === BattleState.ENDED
      ) {
        const winnerTokenId = this.inPlayPlayers[0];
        const winnerURI = await this.contractService.getTokenURI(winnerTokenId);
        const winnerIpfsMetadata = await this.openSeaService
          .getAssetMetadata(winnerURI)
          .toPromise();
        this.winnerPicture = winnerIpfsMetadata.image;
      }

      this.assets = await this.getMintedAssets(contractAddress);
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

  private async getMintedAssets(address: string): Promise<NiftyAssetModel[]> {
    const assets = await this.openSeaService.getAssets(address).toPromise();

    return assets
      .map((asset) => {
        const outOfPlayIndex = this.eliminatedPlayers.indexOf(
          asset.token_id || ''
        );
        const isEliminated = outOfPlayIndex !== -1;
        const isOwner = this.metamaskService.isOwnerAddress(
          asset.owner.address
        );
        const isWinner =
          BattleState.ENDED === this.currBattleState &&
          1 === this.inPlayPlayers.length &&
          asset.token_id === this.inPlayPlayers[0];
        let placement = 0;
        if (isWinner) {
          placement = 1;
        } else if (isEliminated) {
          placement = this.totalPlayers - outOfPlayIndex;
        }

        const pictureURL =
          placement === 1 ? this.winnerPicture : this.defaultPicture;
        const extension = pictureURL.split('.').pop();
        const nftURL = this.sanitizer.bypassSecurityTrustResourceUrl(
          pictureURL
        );

        return {
          ...asset,
          extension,
          isEliminated,
          isOwner,
          nftURL,
          placement,
        } as NiftyAssetModel;
      })
      .sort((a, b) => {
        return (
          Number(b.isOwner) - Number(a.isOwner) ||
          Number(a.isEliminated) - Number(b.isEliminated) ||
          Number(a.token_id) - Number(b.token_id)
        );
      });
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
