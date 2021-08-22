import { OrderJSON } from './opensea.types';

export enum EthereumNetwork {
  MAINNET = 'mainnet',
  RINKEBY = 'rinkeby',
  KOVAN = 'kovan',
}

export enum BattleState {
  STANDBY,
  RUNNING,
  ENDED,
}

export enum ListType {
  DROP = 'drop',
  BATTLE = 'battle',
}

export interface ListItem {
  address: string;
  title: string;
  image: string;
}

export interface Attribute {
  trait_type: string;
  value: string;
}

export interface IpfsMetadataModel {
  attributes: Attribute[];
  description: string;
  external_url: string;
  image: string;
  name: string;
}

export interface NiftyOrderModel {
  buy?: OrderJSON;
  sell?: OrderJSON;
}

export interface NiftyAssetModel {
  order: NiftyOrderModel;
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
