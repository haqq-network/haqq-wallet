import {HaqqCosmosAddress, HaqqEthereumAddress} from '@app/types';

export type NftItem = {
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
};

export type NftCollection = {
  address: HaqqEthereumAddress;
  description: string;
  external_url: HaqqEthereumAddress;
  id: HaqqCosmosAddress;
  image: string;
  name: string;
  nfts: NftItem[];
};
