export interface Contract {
  address: string;
  name: string;
  picture: string;
}

export const CONTRACTS = {
  mainnet: {
    active: [
      {
        address: '0x5a0f9393e7407226A94b0569Fe10aBBBBaF84f00',
        name: 'Nifty Royale X Lushsux - ONE DOES NOT SIMPLY SELL AN NFT',
        picture:
          'https://ipfs.io/ipfs/bafybeiaxk54qzcrni5pzile6rrexwkw5lic5w6u2mzjvoooekplfklo5ue/paintameme.jpeg',
      },
    ],
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
