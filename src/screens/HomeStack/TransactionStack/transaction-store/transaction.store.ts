import {makeAutoObservable} from 'mobx';

import {Provider} from '@app/models/provider';
import {Wallet, WalletModel} from '@app/models/wallet';
import {ChainId, IToken} from '@app/types';

import {TransactionParcicipant} from './transaction-store.types';

class TransactionStore {
  private readonly initialData = {
    address: '',
    chain_id: null,
    wallet: null,
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
      wallet: Wallet.getById(from),
    };
    this.to = {
      address: to ?? '',
      chain_id: null,
      wallet: null,
    };
  };

  // from options
  get fromAddress() {
    return this.from.address;
  }

  get fromWallet() {
    return this.from.wallet;
  }

  get fromChainId() {
    return this.from.chain_id;
  }

  // to options
  get toAddress() {
    return this.to.address.trim();
  }
  set toAddress(address: string) {
    let chain_id = this.to.chain_id;
    if (this.to.chain_id) {
      const isAddressSupported = Provider.getByEthChainId(
        this.to.chain_id,
      )?.isAddressSupported(address);

      if (!isAddressSupported) {
        chain_id = this.autoSelectProviderChainId(address);
      }
    }
    this.to = {
      ...this.to,
      chain_id,
      address,
    };
  }

  get toWallet() {
    return this.to.wallet;
  }
  set toWallet(wallet: WalletModel | null) {
    this.to = {
      ...this.to,
      wallet,
    };
  }

  get toChainId() {
    return this.to.chain_id;
  }
  set toChainId(chain_id: ChainId | null) {
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
  private readonly autoSelectProviderChainId = (value = ''): ChainId | null => {
    return Provider.getByAddress(value)?.ethChainId ?? null;
  };

  clear = () => {
    this.from = {...this.initialData};
    this.to = {...this.initialData};
  };
}

const instance = new TransactionStore();
export {instance as TransactionStore};
