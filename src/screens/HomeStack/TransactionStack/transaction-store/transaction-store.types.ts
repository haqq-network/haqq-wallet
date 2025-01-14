import {WalletModel} from '@app/models/wallet';
import {ChainId, IToken} from '@app/types';

export type TransactionParcicipantFrom = {
  asset: IToken | null;
  wallet: WalletModel | null;
};

export type TransactionParcicipant = {
  address: string;
  asset: IToken | null;
  wallet: WalletModel | null;
  chain_id: ChainId | null;
};
