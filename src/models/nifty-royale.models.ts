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
  contractAddress: string;
  extension: string;
  isEliminated: boolean;
  isOwner: boolean;
  name: string;
  nftURL: string;
  ownerAddress: string;
  placement: number;
  tokenId: string;
}
