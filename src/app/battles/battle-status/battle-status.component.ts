import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { MetamaskService } from '../../services/metamask.service';
import { OpenSeaService } from '../../services/open-sea.service';
import {
  BattleState,
  NiftyAssetModel,
} from '../../../models/nifty-royale.models';

@Component({
  selector: 'app-battle-status',
  templateUrl: './battle-status.component.html',
})
export class BattleStatusComponent implements OnInit {
  battleStates = BattleState;
  assets = [] as NiftyAssetModel[];
  defaultPicture = '';
  winnerPicture = '';
  currBattleState = BattleState.STANDBY;
  inPlayPlayers = [] as string[];
  eliminatedPlayers = [] as string[];
  totalPlayers = 0;
  countdownTimer = '';

  constructor(
    private contractService: ContractService,
    private metamaskService: MetamaskService,
    private openSeaService: OpenSeaService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const { contractAddress } = this.route.snapshot.params;
    await this.contractService.init(contractAddress);

    const {
      uri,
      battleState,
      inPlayPlayers,
      eliminatedPlayers,
      nextEliminationTimestamp,
    } = await this.contractService.getBattleData();

    this.initCountdown(nextEliminationTimestamp);

    const defaultIpfsMetadata = await this.openSeaService
      .getAssetMetadata(uri)
      .toPromise();

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
      const winnerURI = await this.contractService.getWinnerURI(winnerTokenId);
      const winnerIpfsMetadata = await this.openSeaService
        .getAssetMetadata(winnerURI)
        .toPromise();
      this.winnerPicture = winnerIpfsMetadata.image;
    }

    this.assets = await this.getMintedAssets(contractAddress);
  }

  private async getMintedAssets(address: string): Promise<NiftyAssetModel[]> {
    const assets = await this.openSeaService.getAssets(address).toPromise();

    return assets
      .sort((a, b) => Number(a.token_id) - Number(b.token_id))
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
        const nftImageURL =
          placement === 1 ? this.winnerPicture : this.defaultPicture;

        return {
          ...asset,
          nftImageURL,
          isEliminated,
          isOwner,
          placement,
        } as NiftyAssetModel;
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
        this.countdownTimer = this.countdownTimer + days + ':';
      }

      if (hours > 0) {
        this.countdownTimer = this.countdownTimer + hours + ':';
      }

      if (minutes > 0) {
        this.countdownTimer = this.countdownTimer + minutes + ':';
      }

      if (seconds > 0) {
        this.countdownTimer = this.countdownTimer + seconds;
      }

      if (distance < 0) {
        clearInterval(x);
        this.countdownTimer = 'NEW ELIMINATION!';
      }
    }, 1000);
  }
}
