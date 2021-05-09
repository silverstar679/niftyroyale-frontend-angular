import { OpenSeaAsset } from './opensea.types';

export enum BattleState {
  STANDBY = 'STANDBY',
  RUNNING = 'RUNNING',
  ENDED = 'ENDED',
}

export interface IpfsMetadataModel {
  attributes: string[];
  description: string;
  external_url: string;
  image: string;
  name: string;
}

export interface NiftyAssetModel extends OpenSeaAsset {
  nftImageURL: string;
  isEliminated: boolean;
  isOwner: boolean;
  placement: number;
}
