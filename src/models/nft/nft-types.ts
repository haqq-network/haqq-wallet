import {Balance} from '@app/services/balance';
import {HaqqCosmosAddress, HaqqEthereumAddress} from '@app/types';

export type NftCollectionIndexer = {
  address: HaqqEthereumAddress;
  description: string;
  external_url: string;
  id: HaqqCosmosAddress;
  image: string;
  name: string;
  symbol: string;
  created_at: number;
  nfts: NftItemIndexer[];
};

export type NftItemIndexer = {
  address: HaqqCosmosAddress;
  block: number;
  cached_url: string | null;
  contract: HaqqCosmosAddress;
  created_at: string;
  description: string | null;
  file_type: string | null;
  hash: string;
  is_failed: boolean;
  is_link_checked: boolean;
  is_name_checked: boolean;
  metadata: null | Object; // TODO Check it
  name: string;
  original_url: string | null;
  token_id: string;
  updated_at: string;
  price?: string;
  attributes?: any[]; // TODO Add types when will be implemented on BE
};

// TODO Reset image as not null when default image will be provided
export type NftItem = Omit<
  NftItemIndexer,
  'price' | 'description' | 'token_id'
> & {
  description: string;
  price?: Balance;
  tokenId: number;
};

export type NftCollection = Omit<
  NftCollectionIndexer,
  'nfts' | 'description'
> & {
  created_at: number; // FIXME Indexer doesn't contain created_at
  description: string;
  nfts: NftItem[];
};
