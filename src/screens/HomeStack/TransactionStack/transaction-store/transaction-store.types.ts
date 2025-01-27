import {WalletModel} from '@app/models/wallet';
import {ChainId, IToken} from '@app/types';

export type TransactionParcicipantFrom = {
  asset: IToken | null;
  wallet: WalletModel | null;
  amount?: string;
};

export type TransactionParcicipantTo = {
  address: string;
  asset: IToken | null;
  amount?: string;
};

export type ChangellyCurrency = {
  address_url: string;
  blockchain: string;
  blockchain_precision: number;
  contract_address: string;
  enabled: boolean;
  enabled_from: boolean;
  enabled_to: boolean;
  fix_rate_enabled: boolean;
  fixed_time: number;
  full_name: string;
  image: string;
  name: string;
  payin_confirmations: number;
  protocol: string;
  ticker: string;
  transaction_url: string;
  chain_id: ChainId;
};

export type ChangellyQuote = {
  amount_from: string;
  amount_to: string;
  fee: string;
  from: string;
  max: string;
  max_from: string;
  max_to: string;
  min: string;
  min_from: string;
  min_to: string;
  network_fee: string;
  rate: string;
  to: string;
  visible_amount: string;
};
