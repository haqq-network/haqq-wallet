import {makeAutoObservable} from 'mobx';

import {Provider} from '@app/models/provider';
import {ChainId, IToken} from '@app/types';

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
      chain_id: Provider.selectedProvider.ethChainId,
    };
  };

  // from options
  get fromAddress() {
    return this.from?.address!;
  }

  // to options
  get toAddress() {
    return this.to?.address ?? '';
  }
  set toAddress(address: string) {
    this.to = {
      ...(this.to ?? {}),
      address,
    };
  }

  get toChainId() {
    return this.to?.chain_id;
  }
  set toChainId(chain_id: ChainId | undefined) {
    this.to = {
      ...(this.to ?? {
        address: '',
      }),
      chain_id,
    };
  }

  clear = () => {
    this.from = null;
    this.to = null;
  };
}

const instance = new TransactionStore();
export {instance as TransactionStore};
