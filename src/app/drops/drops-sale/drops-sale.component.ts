import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { defer, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { BattleState } from '../../../models/nifty-royale.models';

enum METADATA_TITLE {
  NFT_DESCRIPTION = 'NFT Description',
  ARTIST_DESCRIPTION = 'Artist Description',
  ADDITIONAL_DESCRIPTION = 'Additional Prize Description',
  BASE_NFT_IMAGE = 'Base NFT',
  UPGRADED_NFT_IMAGE = 'Upgraded 1:1 NFT',
}

interface MetadataItem {
  title: string;
  value: string;
}

@Component({
  selector: 'app-drops-sale',
  templateUrl: './drops-sale.component.html',
})
export class DropsSaleComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  contractAddress!: string;
  dropName!: string;
  ethPrice!: string;
  maxUnits!: number;
  maxMinted!: number;
  totalMinted!: number;
  isBattleStarted!: boolean;
  metadata!: Array<MetadataItem>;
  imagesData!: Array<MetadataItem>;

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  get etherScanContractLink(): string {
    return `https://etherscan.io/address/${this.contractAddress}`;
  }

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.params.contractAddress;
    this.subscription = this.route.data
      .pipe(
        mergeMap(({ data }) => {
          const {
            defaultURI,
            winnerURI,
            name,
            ethPrice,
            maxUnits,
            maxMinted,
            totalMinted,
            battleState,
          } = data;

          this.dropName = name;
          this.maxMinted = maxMinted;
          this.totalMinted = totalMinted;
          this.ethPrice = ethPrice;
          this.isBattleStarted = battleState !== BattleState.STANDBY;
          this.maxUnits = maxUnits;

          return defer(() => this.fetchIPFSMetadata(defaultURI, winnerURI));
        })
      )
      .subscribe();
  }

  private async fetchIPFSMetadata(
    defaultURI: string,
    winnerURI: string
  ): Promise<void> {
    const [defaultIpfsMetadata, winnerIpfsMetadata] = await Promise.all([
      this.apiService.getAssetMetadata(defaultURI),
      this.apiService.getAssetMetadata(winnerURI),
    ]);

    const nftDescription = defaultIpfsMetadata.description;
    const artistDescription =
      defaultIpfsMetadata.attributes.find(
        (a) => -1 !== a.trait_type.indexOf(METADATA_TITLE.ARTIST_DESCRIPTION)
      )?.value || '';
    const additionalDescription =
      defaultIpfsMetadata.attributes.find(
        (a) =>
          -1 !== a.trait_type.indexOf(METADATA_TITLE.ADDITIONAL_DESCRIPTION)
      )?.value || '';

    this.metadata = [
      { title: METADATA_TITLE.NFT_DESCRIPTION, value: nftDescription },
      { title: METADATA_TITLE.ARTIST_DESCRIPTION, value: artistDescription },
      {
        title: METADATA_TITLE.ADDITIONAL_DESCRIPTION,
        value: additionalDescription,
      },
    ];

    this.imagesData = [
      {
        title: METADATA_TITLE.BASE_NFT_IMAGE,
        value: defaultIpfsMetadata.image,
      },
      {
        title: METADATA_TITLE.UPGRADED_NFT_IMAGE,
        value: winnerIpfsMetadata.image,
      },
    ];
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
