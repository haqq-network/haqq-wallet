import {Balance} from '@app/services/balance';
import {HaqqCosmosAddress, HaqqEthereumAddress} from '@app/types';

export type NftCollectionIndexer = {
  address: HaqqEthereumAddress;
  description: string;
  external_url: HaqqEthereumAddress;
  id: HaqqCosmosAddress;
  image: string;
  name: string;
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
  metadata: null; // TODO Check it
  name: string | null;
  original_url: string | null;
  token_id: string;
  updated_at: string;
  price?: string;
};

// TODO Reset image as not null when default image will be provided
export type NftItem = Omit<NftItemIndexer, 'price'> & {
  price: Balance;
};

export type NftCollection = Omit<NftCollectionIndexer, 'nfts'> & {
  nfts: NftItem[];
};
