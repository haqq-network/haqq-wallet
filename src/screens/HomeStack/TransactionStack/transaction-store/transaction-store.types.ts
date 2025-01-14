import {WalletModel} from '@app/models/wallet';
import {IToken} from '@app/types';

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
