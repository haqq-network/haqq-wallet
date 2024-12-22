import {WalletModel} from '@app/models/wallet';
import {ChainId} from '@app/types';

export type TransactionParcicipant = {
  address: string;
  wallet: WalletModel | null;
  chain_id: ChainId | null;
};
