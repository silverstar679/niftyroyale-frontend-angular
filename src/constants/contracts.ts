export interface Contract {
  address: string;
  name: string;
}

export interface Contracts {
  [network: string]: Contract[];
}

export const CONTRACTS: Contracts = {
  mainnet: [
    {
      address: '0xCFa9BaabFF2AC2da41385E051386188f4F5BC94d',
      name: `Nifty Royale X Lushsux - Sergey "Big Mac" Nazarov`,
    },
  ],
  kovan: [
    {
      address: '0x6bafc7AfD6bD2E32Cf754c56D219E733278DD29e',
      name: 'Nifty Royale Testnet Drop 1',
    },
  ],
  rinkeby: [
    {
      address: '0xB46747f1633E9BEf69913A0d2ceA2d4815409ee1',
      name: 'Nifty Royale Testnet Drop 1',
    },
    {
      address: '0xAa79A77BaBbDa34d20a013925Cdb8DE0791E1c94',
      name: 'Nifty Royale Testnet Drop 2',
    },
    {
      address: '0x044024c7d9080b9121125c01daA25742a806b42b',
      name: 'Nifty Royale Testnet Drop 3',
    },
  ],
  legacy: [
    {
      address: '0xE025BC21c13a3C5d9b222e3795e9BBe1247633dB',
      name: 'Beta drop #1 featuring Lushsux (50 pieces)',
    },
    {
      address: '0xEc0D8feACF105C364d5B7c2c7222eC708D35d95e',
      name: 'Beta drop #2 featuring Lushsux',
    },
    {
      address: '0xaFa735aBf851896d922c7501D404a4A35f02f5Ae',
      name: 'Beta drop #3 featuring Lushsux',
    },
    {
      address: '0x9dCC49BD1fe90941E03184beD4b0DB422d1251CA',
      name: 'Beta drop #4 featuring Lushsux',
    },
    {
      address: '0x520BB8Ed49c03b39a05F31Af47B534C2846af5da',
      name: 'Beta drop #5 featuring Lushsux',
    },
  ],
};
