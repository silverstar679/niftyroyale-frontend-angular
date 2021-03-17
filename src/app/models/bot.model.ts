export enum CurrencyEnum {
  ETH = 'ETH',
}

export interface BotModel {
  name: string;
  price: number;
  currency: CurrencyEnum;
}
