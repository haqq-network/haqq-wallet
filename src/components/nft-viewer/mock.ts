import {AddressUtils} from '@app/helpers/address-utils';
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
        id: '1',
        created_at: '2023-11-21T10:18:34.013598Z',
        address: AddressUtils.toHaqq(getRandomWalletAddress()),
        name: 'Item 1',
        description: 'The first item in the collection',
        image: {uri: 'https://i.ibb.co/ckN9nKJ/9.jpg'},
        price: 'de0b6b3a7640000',
        // attributes: [
        //   {
        //     trait_type: 'Background',
        //     value: 'Red',
        //     frequency: 0.3,
        //   },
        //   {
        //     trait_type: 'Rarity',
        //     value: 'Rare',
        //     frequency: 0.2,
        //   },
        //   {
        //     trait_type: 'Edition',
        //     value: '1 of 50',
        //     frequency: 0.9,
        //   },
        // ],
      },
      {
        id: '2',
        created_at: '2023-11-21T10:18:34.013598Z',
        address: AddressUtils.toHaqq(getRandomWalletAddress()),
        name: 'Item 2',
        description:
          'The second item in the collection. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident, sunt in culpa',
        image: {uri: 'https://i.ibb.co/9VGgYqf/10.jpg'},
        price: '1b4c9f8f0a0000',
        // attributes: [
        //   {
        //     trait_type: 'Background',
        //     value: 'Green',
        //     frequency: 0.3,
        //   },
        //   {
        //     trait_type: 'Rarity',
        //     value: 'Common',
        //     frequency: 0.1,
        //   },
        //   {
        //     trait_type: 'Edition',
        //     value: '1 of 100',
        //     frequency: 0.4,
        //   },
        // ],
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
        id: '3',
        created_at: '2023-11-21T10:18:34.013598Z',
        address: AddressUtils.toHaqq(getRandomWalletAddress()),
        name: 'Item 1',
        description: 'The first item in the collection',
        image: {uri: 'https://i.ibb.co/YfCJncn/13.jpg'},
        price: 'de0b6b3a7640000',
        // attributes: [
        //   {
        //     trait_type: 'Background',
        //     value: 'Red',
        //     frequency: 0.3,
        //   },
        //   {
        //     trait_type: 'Rarity',
        //     value: 'Rare',
        //     frequency: 0.2,
        //   },
        //   {
        //     trait_type: 'Edition',
        //     value: '1 of 50',
        //     frequency: 0.9,
        //   },
        // ],
      },
      {
        id: '4',
        created_at: '2023-11-21T10:18:34.013598Z',
        address: AddressUtils.toHaqq(getRandomWalletAddress()),
        name: 'Item 2',
        description:
          'The second item in the collection. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident, sunt in culpa',
        image: {uri: 'https://i.ibb.co/wz6Pvsx/14.jpg'},
        price: '1b4c9f8f0a0000',
        // attributes: [
        //   {
        //     trait_type: 'Background',
        //     value: 'Green',
        //     frequency: 0.3,
        //   },
        //   {
        //     trait_type: 'Rarity',
        //     value: 'Common',
        //     frequency: 0.1,
        //   },
        //   {
        //     trait_type: 'Edition',
        //     value: '1 of 100',
        //     frequency: 0.4,
        //   },
        // ],
      },
      {
        id: '5',
        created_at: '2023-11-21T10:18:34.013598Z',
        address: AddressUtils.toHaqq(getRandomWalletAddress()),
        name: 'Item 3',
        description: 'The first item in the collection',
        image: {uri: 'https://i.ibb.co/QpDGWdv/15.jpg'},
        price: 'de0b6b3a7640000',
        // attributes: [
        //   {
        //     trait_type: 'Background',
        //     value: 'Red',
        //     frequency: 0.3,
        //   },
        //   {
        //     trait_type: 'Rarity',
        //     value: 'Rare',
        //     frequency: 0.2,
        //   },
        //   {
        //     trait_type: 'Edition',
        //     value: '1 of 50',
        //     frequency: 0.9,
        //   },
        // ],
      },
      {
        id: '6',
        created_at: '2023-11-21T10:18:34.013598Z',
        address: AddressUtils.toHaqq(getRandomWalletAddress()),
        name: 'Item 4',
        description: 'The first item in the collection',
        image: {uri: 'https://i.ibb.co/mTXCy1Z/16.jpg'},
        price: 'de0b6b3a7640000',
        // attributes: [
        //   {
        //     trait_type: 'Background',
        //     value: 'Red',
        //     frequency: 0.3,
        //   },
        //   {
        //     trait_type: 'Rarity',
        //     value: 'Rare',
        //     frequency: 0.2,
        //   },
        //   {
        //     trait_type: 'Edition',
        //     value: '1 of 50',
        //     frequency: 0.9,
        //   },
        // ],
      },
      {
        id: '7',
        created_at: '2023-11-21T10:18:34.013598Z',
        address: AddressUtils.toHaqq(getRandomWalletAddress()),
        name: 'Item 5',
        description: 'The first item in the collection',
        image: {uri: 'https://i.ibb.co/8ggZmh8/17.jpg'},
        price: 'de0b6b3a7640000',
        // attributes: [
        //   {
        //     trait_type: 'Background',
        //     value: 'Red',
        //     frequency: 0.3,
        //   },
        //   {
        //     trait_type: 'Rarity',
        //     value: 'Rare',
        //     frequency: 0.2,
        //   },
        //   {
        //     trait_type: 'Edition',
        //     value: '1 of 50',
        //     frequency: 0.9,
        //   },
        // ],
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
        id: '8',
        created_at: '2023-11-21T10:18:34.013598Z',
        address: AddressUtils.toHaqq(getRandomWalletAddress()),
        name: 'Item 1',
        description: 'The first item in the collection',
        image: {uri: 'https://i.ibb.co/3Bq50Q8/21.jpg'},
        price: 'de0b6b3a7640000',
        // attributes: [
        //   {
        //     trait_type: 'Background',
        //     value: 'Red',
        //     frequency: 0.3,
        //   },
        //   {
        //     trait_type: 'Rarity',
        //     value: 'Rare',
        //     frequency: 0.2,
        //   },
        //   {
        //     trait_type: 'Edition',
        //     value: '1 of 50',
        //     frequency: 0.9,
        //   },
        // ],
      },
    ],
  };

  return [collection1, collection2, collection3];
};
