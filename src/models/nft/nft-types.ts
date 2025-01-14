import {CurrencyRate} from '@app/models/types';
import {Balance} from '@app/services/balance';
import {AddressCosmosHaqq, AddressEthereum, ChainId} from '@app/types';

export type NftCollectionIndexer = {
  address: AddressEthereum;
  description: string;
  external_url: string;
  chain_id: number;
  id: AddressCosmosHaqq;
  image: string;
  name: string;
  symbol: string;
  created_at: number;
  nfts: NftItemIndexer[];
};

export type NftItemIndexer = {
  address: AddressCosmosHaqq;
  amount: number; // number of copies
  attributes: NftAttribute[] | null;
  block: number;
  cached_url: string | null;
  contract: AddressCosmosHaqq;
  created_at: string;
  description: string | null;
  file_type: string | null;
  hash: string;
  is_failed: boolean;
  is_link_checked: boolean;
  is_name_checked: boolean;
  metadata: null | NftMetadata;
  name: string;
  original_url: string | null;
  token_id: string;
  updated_at: string;
  price?: CurrencyRate;
  properties: Record<string, string> | null;
  chain_id: ChainId;
};

type NftMetadata = {
  description: string;
  image: string;
  name: string;
};

export type NftAttribute = {
  display_type: string;
  trait_type: string;
  value: string;
};

// TODO Reset image as not null when default image will be provided
export type NftItem = Omit<
  NftItemIndexer,
  'price' | 'description' | 'token_id'
> & {
  chain_id: ChainId;
  contractType: ContractType;
  description: string;
  price?: Balance;
  tokenId: number;
  is_transfer_prohibinden: boolean;
};

export type NftCollection = Omit<
  NftCollectionIndexer,
  'nfts' | 'description'
> & {
  contractType: ContractType;
  created_at: number; // FIXME Indexer doesn't contain created_at
  description: string;
  is_transfer_prohibinden: boolean;
  nfts: NftItem[];
};

export enum ContractType {
  erc721,
  erc1155,
}
