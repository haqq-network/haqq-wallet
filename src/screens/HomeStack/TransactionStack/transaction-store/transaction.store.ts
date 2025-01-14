import {makeAutoObservable} from 'mobx';

import {Provider} from '@app/models/provider';
import {Wallet, WalletModel} from '@app/models/wallet';
import {ChainId, IToken} from '@app/types';

import {
  TransactionParcicipant,
  TransactionParcicipantFrom,
} from './transaction-store.types';

class TransactionStore {
  private readonly initialDataFrom = {
    wallet: null,
    asset: null,
  };
  private readonly initialData = {
    address: '',
    chain_id: null,
    wallet: null,
    asset: null,
  };

  private from: TransactionParcicipantFrom = {...this.initialDataFrom};
  private to: TransactionParcicipant = {...this.initialData};

  constructor() {
    makeAutoObservable(this);
  }

  init = (from: string, to?: string, token?: IToken) => {
    this.from = {
      ...this.from,
      wallet: Wallet.getById(from),
      asset: token ?? null,
    };
    this.to = {
      ...this.to,
      address: to ?? '',
    };
  };

  // from options
  get wallet() {
    return this.from.wallet!;
  }
  set wallet(wallet: WalletModel) {
    this.from = {
      ...this.from,
      wallet,
    };
  }

  get fromChainId() {
    return this.from.asset?.chain_id;
  }

  get fromAsset() {
    return this.from.asset;
  }
  set fromAsset(asset: IToken | null) {
    this.from = {
      ...this.from,
      asset,
    };
  }

  // to options
  get toAddress() {
    return this.to.address.trim();
  }
  set toAddress(address: string) {
    let chain_id = this.to.chain_id;
    const isAddressSupported = this.to.chain_id
      ? Provider.getByEthChainId(this.to.chain_id)?.isAddressSupported(address)
      : true;

    if (isAddressSupported) {
      chain_id = this.autoSelectProviderChainId(address);
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
    this.from = {...this.initialDataFrom};
    this.to = {...this.initialData};
  };
}

const instance = new TransactionStore();
export {instance as TransactionStore};
