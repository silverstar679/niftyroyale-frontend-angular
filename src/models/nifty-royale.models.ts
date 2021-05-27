import { OpenSeaAsset } from './opensea.types';

export enum EthereumNetwork {
  MAINNET = 'mainnet',
  RINKEBY = 'rinkeby',
  KOVAN = 'kovan',
}

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
  extension: string;
  isEliminated: boolean;
  isOwner: boolean;
  nftURL: string;
  placement: number;
}
