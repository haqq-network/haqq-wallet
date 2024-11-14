import {makeAutoObservable} from 'mobx';

import {IToken} from '@app/types';

import {TransactionParcicipant} from './transaction-store.types';

class TransactionStore {
  from: TransactionParcicipant | null = null;
  to: TransactionParcicipant | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  init = (from: string, to?: string, token?: IToken) => {
    this.from = {
      address: from,
      chain_id: token?.chain_id,
    };
    this.to = {
      address: to ?? '',
      chain_id: token?.chain_id,
    };
  };

  get fromAddress() {
    return this.from?.address!;
  }

  get toAddress() {
    return this.to?.address ?? '';
  }
  set toAddress(address: string) {
    this.to = {
      ...(this.to ?? {}),
      address,
    };
  }

  clear = () => {
    this.from = null;
    this.to = null;
  };
}

const instance = new TransactionStore();
export {instance as TransactionStore};
