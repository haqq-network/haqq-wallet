import {Wallet} from '@app/models/wallet';
import {NftCollection} from '@app/types';

const getRandomWalletAddress = () => {
  const wallets = Wallet.getAllVisible();
  const randomWallet = wallets[Math.floor(Math.random() * wallets.length)];
  return randomWallet?.address;
};

export const createNftCollectionSet = () => {
  const collection1: NftCollection = {
    created_at: Date.now() - 2000,
    address: '0x16e7fC3B63D7bCc751717ef6eDE9132b6A22Dc86',
    name: 'My NFT Collection 1',
    description:
      'A collection of unique digital assets. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident, sunt in culpa',
    image: 'https://i.ibb.co/kByvZnJ/8.jpg',
    external_link: 'https://example.com/collection',
    items: [
      {
        address: '0x8cBd3f769b0257A2d75dF8dD16527b6a13E6b01A',
        owner_address: getRandomWalletAddress(),
        name: 'Item 1',
        description: 'The first item in the collection',
        image: 'https://i.ibb.co/ckN9nKJ/9.jpg',
        external_link: 'https://example.com/item1',
        last_sale_price: 'de0b6b3a7640000',
        attributes: [
          {
            trait_type: 'Background',
            value: 'Red',
            frequency: 0.3,
          },
          {
            trait_type: 'Rarity',
            value: 'Rare',
            frequency: 0.2,
          },
          {
            trait_type: 'Edition',
            value: '1 of 50',
            frequency: 0.9,
          },
        ],
      },
      {
        address: '0xE1e3Dd6b45C0b9e0D0b4Ae3F1A499F21b6d3a5E7',
        owner_address: '0xE1e3Dd6b45C0b9e0D0b4Ae3F1A499F21b6d3a5E7',
        name: 'Item 2',
        description:
          'The second item in the collection. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident, sunt in culpa',
        image: 'https://i.ibb.co/9VGgYqf/10.jpg',
        external_link: 'https://example.com/item2',
        last_sale_price: '1b4c9f8f0a0000',
        attributes: [
          {
            trait_type: 'Background',
            value: 'Green',
            frequency: 0.3,
          },
          {
            trait_type: 'Rarity',
            value: 'Common',
            frequency: 0.1,
          },
          {
            trait_type: 'Edition',
            value: '1 of 100',
            frequency: 0.4,
          },
        ],
      },
    ],
  };

  const collection2: NftCollection = {
    created_at: Date.now() - 3000,
    address: '0x4dA2563dF61d2f96B56aF5c6D9606b2e5d98e25D',
    name: 'NFT Collection 2',
    description:
      'A collection of unique digital assets. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident, sunt in culpa',
    image: 'https://i.ibb.co/QvH8ZwC/11.jpg',
    external_link: 'https://example.com/collection',
    items: [
      {
        address: '0x75Ee8A09d845Db2b2f4b9D5A420568c4B889f5C2',
        owner_address: getRandomWalletAddress(),
        name: 'Item 1',
        description: 'The first item in the collection',
        image: 'https://i.ibb.co/YfCJncn/13.jpg',
        external_link: 'https://example.com/item1',
        last_sale_price: 'de0b6b3a7640000',
        attributes: [
          {
            trait_type: 'Background',
            value: 'Red',
            frequency: 0.3,
          },
          {
            trait_type: 'Rarity',
            value: 'Rare',
            frequency: 0.2,
          },
          {
            trait_type: 'Edition',
            value: '1 of 50',
            frequency: 0.9,
          },
        ],
      },
      {
        address: '0x398A2Be87513A3Ea1a845EA07d2c2095f51e0Da0',
        owner_address: getRandomWalletAddress(),
        name: 'Item 2',
        description:
          'The second item in the collection. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident, sunt in culpa',
        image: 'https://i.ibb.co/wz6Pvsx/14.jpg',
        external_link: 'https://example.com/item2',
        last_sale_price: '1b4c9f8f0a0000',
        attributes: [
          {
            trait_type: 'Background',
            value: 'Green',
            frequency: 0.3,
          },
          {
            trait_type: 'Rarity',
            value: 'Common',
            frequency: 0.1,
          },
          {
            trait_type: 'Edition',
            value: '1 of 100',
            frequency: 0.4,
          },
        ],
      },
      {
        address: '0x9a39Ae8c9e1b84299D56C27f33fB32a0Dc68F6B4',
        owner_address: getRandomWalletAddress(),
        name: 'Item 3',
        description: 'The first item in the collection',
        image: 'https://i.ibb.co/QpDGWdv/15.jpg',
        external_link: 'https://example.com/item1',
        last_sale_price: 'de0b6b3a7640000',
        attributes: [
          {
            trait_type: 'Background',
            value: 'Red',
            frequency: 0.3,
          },
          {
            trait_type: 'Rarity',
            value: 'Rare',
            frequency: 0.2,
          },
          {
            trait_type: 'Edition',
            value: '1 of 50',
            frequency: 0.9,
          },
        ],
      },
      {
        address: '0x2C6bF22f7DdB9dC2D8a8b2Ca36Fd43Fe29d0A5a9',
        owner_address: getRandomWalletAddress(),
        name: 'Item 4',
        description: 'The first item in the collection',
        image: 'https://i.ibb.co/mTXCy1Z/16.jpg',
        external_link: 'https://example.com/item1',
        last_sale_price: 'de0b6b3a7640000',
        attributes: [
          {
            trait_type: 'Background',
            value: 'Red',
            frequency: 0.3,
          },
          {
            trait_type: 'Rarity',
            value: 'Rare',
            frequency: 0.2,
          },
          {
            trait_type: 'Edition',
            value: '1 of 50',
            frequency: 0.9,
          },
        ],
      },
      {
        address: '0xB1c78f4989721aC7E35BcB03D94FeD9292B20e87',
        owner_address: getRandomWalletAddress(),
        name: 'Item 5',
        description: 'The first item in the collection',
        image: 'https://i.ibb.co/8ggZmh8/17.jpg',
        external_link: 'https://example.com/item1',
        last_sale_price: 'de0b6b3a7640000',
        attributes: [
          {
            trait_type: 'Background',
            value: 'Red',
            frequency: 0.3,
          },
          {
            trait_type: 'Rarity',
            value: 'Rare',
            frequency: 0.2,
          },
          {
            trait_type: 'Edition',
            value: '1 of 50',
            frequency: 0.9,
          },
        ],
      },
    ],
  };

  const collection3: NftCollection = {
    created_at: Date.now() - 4000,
    address: '0xd55E1eBF3AFC9Cf2d570C515F03d92F6Db6f1897',
    name: 'Collection 3',
    description:
      'A collection of unique digital assets. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident, sunt in culpa',
    image: 'https://i.ibb.co/fx9fHNf/18.jpg',
    external_link: 'https://example.com/collection',
    items: [
      {
        address: '0x8a45b62eC7A9Dd058a4C5843c25636Ae775Ef79D',
        owner_address: getRandomWalletAddress(),
        name: 'Item 1',
        description: 'The first item in the collection',
        image: 'https://i.ibb.co/3Bq50Q8/21.jpg',
        external_link: 'https://example.com/item1',
        last_sale_price: 'de0b6b3a7640000',
        attributes: [
          {
            trait_type: 'Background',
            value: 'Red',
            frequency: 0.3,
          },
          {
            trait_type: 'Rarity',
            value: 'Rare',
            frequency: 0.2,
          },
          {
            trait_type: 'Edition',
            value: '1 of 50',
            frequency: 0.9,
          },
        ],
      },
    ],
  };

  return [collection1, collection2, collection3];
};
