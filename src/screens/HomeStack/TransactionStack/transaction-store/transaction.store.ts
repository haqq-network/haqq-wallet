import {makeAutoObservable, runInAction} from 'mobx';

import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Wallet, WalletModel} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {ChainId, IToken} from '@app/types';

import {
  ChangellyCurrency,
  TransactionParcicipantFrom,
  TransactionParcicipantTo,
} from './transaction-store.types';

class TransactionStore {
  private readonly initialDataFrom = {
    wallet: null,
    asset: null,
  };
  private readonly initialDataTo = {
    address: '',
    asset: null,
  };

  private from: TransactionParcicipantFrom = {...this.initialDataFrom};
  private to: TransactionParcicipantTo = {...this.initialDataTo};
  private availableCurrencies: ChangellyCurrency[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  init = async (from: string, to?: string, token?: IToken) => {
    runInAction(() => {
      this.from = {
        ...this.from,
        wallet: Wallet.getById(from),
        asset: token ?? null,
      };
      this.to = {
        ...this.to,
        address: to ?? '',
      };
    });

    const availableCurrencies = await Backend.instance.fetchCurrencies();
    runInAction(() => {
      this.availableCurrencies = availableCurrencies;
    });
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

  get fromAmount() {
    return this.from.amount;
  }
  set fromAmount(amount: string | undefined) {
    this.from = {
      ...this.from,
      amount,
    };
  }

  // to options
  get toAddress() {
    return this.to.address.trim();
  }
  set toAddress(address: string) {
    let chain_id = this.to.asset?.chain_id ?? null;
    const isAddressSupported = chain_id
      ? Provider.getByEthChainId(chain_id)?.isAddressSupported(address)
      : true;

    if (isAddressSupported) {
      chain_id = this.autoSelectProviderChainId(address);
    }

    if (chain_id) {
      const provider = Provider.getByEthChainId(chain_id);
      const asset = Token.generateNativeToken(this.from.wallet!, provider);

      this.to = {
        ...this.to,
        asset,
        address,
      };
    }
  }

  get toChainId() {
    return this.to.asset?.chain_id ?? null;
  }
  set toChainId(chain_id: ChainId | null) {
    if (chain_id) {
      const provider = Provider.getByEthChainId(chain_id);
      const asset = Token.generateNativeToken(this.from.wallet!, provider);

      this.to = {
        ...this.to,
        asset,
      };
    }
  }

  get toAsset() {
    return this.to.asset;
  }
  set toAsset(asset: IToken | null) {
    this.to = {
      ...this.to,
      asset,
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
    this.to = {...this.initialDataTo};
  };
}

const instance = new TransactionStore();
export {instance as TransactionStore};
