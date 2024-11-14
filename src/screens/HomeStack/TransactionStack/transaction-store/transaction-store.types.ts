import {ChainId} from '@app/types';

export type TransactionParcicipant = {
  address: string;
  chain_id?: ChainId;
};
