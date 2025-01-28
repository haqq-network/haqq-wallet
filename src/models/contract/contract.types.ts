import {AddressEthereum, ChainId} from '@app/types';

export type ContractStoreData = Record<
  ChainId,
  Record<string, IndexerContract>
>;

export type IndexerContract = {
  chain_id: ChainId;
  coingecko_id: string | null;
  created_at: string;
  decimals: number | null;
  eth_address: AddressEthereum;
  ibc: null;
  icon: string | null;
  id: AddressEthereum;
  is_coingecko_watch: boolean | null;
  is_erc1155: boolean | null;
  is_erc20: boolean | null;
  is_erc721: boolean | null;
  is_in_white_list: boolean | null;
  is_skip_eth_tx: boolean | null;
  is_transfer_prohibinden: boolean | null;
  min_input_amount: number | null;
  name: string | null;
  symbol: string | null;
  updated_at: string;
};
