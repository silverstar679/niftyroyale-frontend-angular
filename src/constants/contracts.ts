export interface Contract {
  address: string;
  name: string;
}

export const CONTRACTS = {
  mainnet: {
    active: [],
    past: [
      {
        address: '0xCFa9BaabFF2AC2da41385E051386188f4F5BC94d',
        name: `Nifty Royale X Lushsux - Sergey "Big Mac" Nazarov`,
      },
    ],
  },
  kovan: {
    active: [],
    past: [
      {
        address: '0x6bafc7AfD6bD2E32Cf754c56D219E733278DD29e',
        name: 'Nifty Royale Testnet Drop 1',
      },
    ],
  },
  rinkeby: {
    active: [
      {
        address: '0x8B90c1D5237489c8719052825D703239eaCD7726',
        name: 'Nifty Royale Test Events',
      },
      {
        address: '0x044024c7d9080b9121125c01daA25742a806b42b',
        name: 'Nifty Royale Testnet Drop',
      },
    ],
    past: [
      {
        address: '0xB46747f1633E9BEf69913A0d2ceA2d4815409ee1',
        name: 'Nifty Royale Testnet Drop 1',
      },
      {
        address: '0xAa79A77BaBbDa34d20a013925Cdb8DE0791E1c94',
        name: 'Nifty Royale Testnet Drop 2',
      },
    ],
  },
};
