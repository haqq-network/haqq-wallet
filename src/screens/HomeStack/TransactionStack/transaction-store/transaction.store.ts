import debounce from 'lodash.debounce';
import {makeAutoObservable, runInAction} from 'mobx';

import {AddressUtils} from '@app/helpers/address-utils';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Wallet, WalletModel} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {ChainId, IToken} from '@app/types';

import {
  ChangellyCurrency,
  ChangellyQuote,
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

  // api
  private controllers: Record<string, AbortController> = {};
  private _availableCurrencies: ChangellyCurrency[] = [];
  private _quote: ChangellyQuote | null = null;
  private _quoteError: string = '';

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

    const controller = this.setAbortController('init');
    const availableCurrencies =
      await Backend.instance.fetchCrossChainCurrencies(controller.signal);
    runInAction(() => {
      this._availableCurrencies = availableCurrencies;
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
      amount: undefined,
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

    this.isCrossChain && this.getQuote();
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
      amount: undefined,
    };
  }

  get toAmount() {
    return this.to.amount;
  }
  set toAmount(amount: string | undefined) {
    this.to = {
      ...this.to,
      amount,
    };
  }

  // common options
  get isCrossChain() {
    return (
      this.from.asset?.chain_id !== this.to.asset?.chain_id ||
      this.from.asset?.id !== this.to.asset?.id
    );
  }

  get quote() {
    return this._quote;
  }

  get quoteError() {
    return this._quoteError;
  }

  isCurrencyAvailable = (token: IToken) => {
    if (token.isNativeToken) {
      return Boolean(
        this._availableCurrencies.find(
          currency =>
            currency.chain_id === token.chain_id && !currency.contract_address,
        ),
      );
    }

    return Boolean(
      this._availableCurrencies.find(
        currency =>
          currency.chain_id === token.chain_id &&
          AddressUtils.equals(currency.contract_address, token.id),
      ),
    );
  };

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

  /**
   * @name getQuote
   * @description Calculate quote for swap
   */
  private readonly getQuote = debounce(async (): Promise<void> => {
    try {
      const controller = this.setAbortController('getQuote');
      if (this.fromAsset?.symbol && this.toAsset?.symbol && this.fromAmount) {
        const response = await Backend.instance.fetchCrossChainQuote(
          {
            from: this.fromAsset?.symbol.toLowerCase(),
            to: this.toAsset?.symbol.toLowerCase(),
            amount: this.fromAmount,
          },
          controller.signal,
        );

        runInAction(() => {
          this._quote = response;
        });
      }
    } catch (e) {
      runInAction(() => {
        this._quote = null;
        this._quoteError = (e as unknown as Error).message;
      });
    }
  }, 500);

  /**
   * @name setAbortController
   * @param name Controller's name
   * @returns AbortController
   */
  private readonly setAbortController = (name: string) => {
    const controller = this.controllers[name];
    controller && controller.abort();
    this.controllers[name] = new AbortController();
    return this.controllers[name];
  };

  clear = () => {
    this.from = {...this.initialDataFrom};
    this.to = {...this.initialDataTo};
  };
}

const instance = new TransactionStore();
export {instance as TransactionStore};
