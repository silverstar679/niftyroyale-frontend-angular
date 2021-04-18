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
  isEliminated: boolean;
  isForSale: boolean;
  isOwner: boolean;
  placement: number;
  price: number;
}
