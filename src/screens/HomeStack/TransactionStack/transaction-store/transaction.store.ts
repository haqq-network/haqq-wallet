import {makeAutoObservable} from 'mobx';

import {Provider} from '@app/models/provider';
import {ChainId, IToken} from '@app/types';
import {MAINNET_ETH_CHAIN_ID, TRON_CHAIN_ID} from '@app/variables/common';

import {TransactionParcicipant} from './transaction-store.types';

class TransactionStore {
  private initialData = {
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
      chain_id: this.autoSelectToProviderChainId(),
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
   * @name autoSelectToProviderChainId
   * @description Check entered TO address and auto select provider for this address
   *
   * @returns ETH chain id if address format supported and undefined when its unsupported
   */
  private autoSelectToProviderChainId = (): ChainId | undefined => {
    const toAddress = this.to.address.toLowerCase();

    if (!toAddress) {
      return undefined;
    }

    const currentToProvider = this.to.chain_id
      ? Provider.getByEthChainId(this.to.chain_id)
      : null;

    if (toAddress.startsWith('haqq') && !currentToProvider?.isHaqqNetwork) {
      return MAINNET_ETH_CHAIN_ID;
    }

    if (
      toAddress.startsWith('0x') &&
      !currentToProvider?.isEVM &&
      !currentToProvider?.isHaqqNetwork
    ) {
      return MAINNET_ETH_CHAIN_ID;
    }

    if (toAddress.startsWith('T') && !currentToProvider?.isTron) {
      return TRON_CHAIN_ID;
    }

    return undefined;
  };

  clear = () => {
    this.from = {...this.initialData};
    this.to = {...this.initialData};
  };
}

const instance = new TransactionStore();
export {instance as TransactionStore};
