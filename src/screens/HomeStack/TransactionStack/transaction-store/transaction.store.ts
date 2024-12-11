import {makeAutoObservable} from 'mobx';

import {Provider} from '@app/models/provider';
import {ChainId, IToken} from '@app/types';

import {TransactionParcicipant} from './transaction-store.types';

class TransactionStore {
  private readonly initialData = {
    address: '',
    chain_id: Provider.selectedProvider.ethChainId,
  };

  from: TransactionParcicipant = {...this.initialData};
  to: TransactionParcicipant = {...this.initialData};

  constructor() {
    makeAutoObservable(this);
  }

  init = (from: string, to?: string, token?: IToken) => {
    this.from = {
      address: from,
      chain_id: token?.chain_id ?? this.from.chain_id,
    };
    this.to = {
      address: to ?? '',
    };
  };

  // from options
  get fromAddress() {
    return this.from.address;
  }

  // to options
  get toAddress() {
    return this.to.address;
  }
  set toAddress(address: string) {
    this.to = {
      ...this.to,
      chain_id: this.autoSelectProviderChainId(address),
      address,
    };
  }

  get toChainId() {
    return this.to.chain_id;
  }
  set toChainId(chain_id: ChainId | undefined) {
    this.to = {
      ...this.to,
      chain_id,
    };
  }

  /**
   * private helpers
   */

  /**
   * @name autoSelectProviderChainId
   * @description Check entered TO address and auto select provider for this address
   *
   * @returns ETH chain id if address format supported and undefined when its unsupported
   */
  private readonly autoSelectProviderChainId = (
    value = '',
  ): ChainId | undefined => {
    return Provider.getByAddress(value)?.ethChainId;
  };

  clear = () => {
    this.from = {...this.initialData};
    this.to = {...this.initialData};
  };
}

const instance = new TransactionStore();
export {instance as TransactionStore};
