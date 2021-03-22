export enum CurrencyEnum {
  ETH = 'ETH',
}

export interface BotModel {
  name: string;
  image: string;
  collection: string;
  price: number;
  currency: CurrencyEnum;
}
