export interface Contract {
  address: string;
  name: string;
  picture: string;
}

export const CONTRACTS = {
  mainnet: {
    active: [],
    past: [
      {
        address: '0xCFa9BaabFF2AC2da41385E051386188f4F5BC94d',
        name: 'Nifty Royale X Lushsux - Sergey "Big Mac" Nazarov',
        picture:
          'https://ipfs.io/ipfs/bafybeianq5jagquleaapi5axwzc5nzychnr6dfqxdkld2yztd7kzfelmr4/SergeyBigMacNazarov.jpg',
      },
    ],
  },
  kovan: {
    active: [],
    past: [],
  },
  rinkeby: {
    active: [],
    past: [],
  },
};
