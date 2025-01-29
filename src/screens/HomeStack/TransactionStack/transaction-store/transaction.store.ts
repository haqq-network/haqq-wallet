import debounce from 'lodash.debounce';
import {makeAutoObservable, runInAction} from 'mobx';

import {AddressUtils} from '@app/helpers/address-utils';
import {EstimationVariant} from '@app/models/fee';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Wallet, WalletModel} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {Backend} from '@app/services/backend';
import {Balance} from '@app/services/balance';
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
  private _controllers: Record<string, AbortController> = {};
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

    const controller = this._setAbortController('init');
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

    if (this.isCrossChain) {
      this._getQuote();
    } else {
      this._getFee();
    }
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
      chain_id = this._autoSelectProviderChainId(address);
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
  set quote(value: ChangellyQuote | null) {
    if (value) {
      this._quoteError = '';
    }
    this._quote = value;
    this.toAmount = value?.amount_to || '0';
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
   * @name _autoSelectProviderChainId
   * @description Check entered TO address and auto select provider for this address
   *
   * @returns ETH chain id if address format supported and undefined when its unsupported
   */
  private readonly _autoSelectProviderChainId = (
    value = '',
  ): ChainId | null => {
    return Provider.getByAddress(value)?.ethChainId ?? null;
  };

  /**
   * @name _getQuote
   * @description Calculate quote for swap
   */
  private readonly _getQuote = debounce(async (): Promise<void> => {
    try {
      const controller = this._setAbortController('getQuote');
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
          this.quote = response;
        });
      }
    } catch (e) {
      runInAction(() => {
        this.quote = null;
        this._quoteError = (e as unknown as Error).message;
      });
    }
  }, 500);

  /**
   * @name _getFee
   * @description Calculate quote for swap
   */
  private readonly _getFee = debounce(async (): Promise<any> => {
    if (
      this.fromAsset?.symbol &&
      this.toAsset?.symbol &&
      this.fromAmount &&
      this.fromChainId
    ) {
      try {
        const provider = Provider.getByEthChainId(this.fromChainId);
        if (this.fromAsset?.is_erc20) {
          const contractAddress = provider?.isTron
            ? AddressUtils.hexToTron(this.fromAsset.id)
            : AddressUtils.toEth(this.fromAsset.id);

          return await EthNetwork.estimateERC20Transfer(
            {
              from: this.wallet.address,
              to: this.toAddress,
              amount: new Balance(
                this.fromAmount,
                provider?.decimals,
                provider?.denom,
              ),
              contractAddress,
            },
            EstimationVariant.average,
            provider,
          );
        } else {
          return await EthNetwork.estimate(
            {
              from: this.wallet.address,
              to: this.toAddress,
              value: new Balance(
                this.fromAmount,
                provider?.decimals,
                provider?.denom,
              ),
            },
            EstimationVariant.average,
            provider,
          );
        }
      } catch (e) {
        runInAction(() => {
          this.quote = null;
          this._quoteError = (e as unknown as Error).message;
        });
      }
    }
  }, 500);

  /**
   * @name _setAbortController
   * @description Setup AbortController by name to be able to resend some requests without additional network cost
   * @param name Controller's name
   * @returns AbortController
   */
  private readonly _setAbortController = (name: string) => {
    const controller = this._controllers[name];
    controller && controller.abort();
    this._controllers[name] = new AbortController();
    return this._controllers[name];
  };

  /**
   * @name _abortAllRequests
   * @description Abort all not completed requests to prevent unexpected crashes and issues
   */
  private readonly _abortAllRequests = () => {
    Object.values(this._controllers).forEach(controller => controller.abort());
    this._controllers = {};
  };

  clear = () => {
    this.from = {...this.initialDataFrom};
    this.to = {...this.initialDataTo};

    // api
    this._abortAllRequests();
    this.quote = null;
    this._quoteError = '';
  };
}

const instance = new TransactionStore();
export {instance as TransactionStore};
