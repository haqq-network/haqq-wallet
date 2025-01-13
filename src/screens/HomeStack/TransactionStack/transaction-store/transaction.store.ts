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

  private from: TransactionParcicipant = {...this.initialData};
  private to: TransactionParcicipant = {...this.initialData};
  private _asset: IToken | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  init = (from: string, to?: string, token?: IToken) => {
    this._asset = token ?? null;
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

  // asset options
  get asset() {
    return this._asset;
  }
  set asset(asset: IToken | null) {
    this._asset = asset;
    this.from = {
      ...this.from,
      chain_id: asset!.chain_id,
    };
  }

  // from options
  get fromAddress() {
    return this.from.address;
  }
  set fromAddress(from: string) {
    this.from = {
      ...this.from,
      address: from,
      wallet: Wallet.getById(from),
    };
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
    this._asset = null;
    this.from = {...this.initialData};
    this.to = {...this.initialData};
  };
}

const instance = new TransactionStore();
export {instance as TransactionStore};
