import {hashMessage} from '@walletconnect/utils';
import {makeAutoObservable, runInAction, when} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {Currency, CurrencyRate} from '@app/models/types';
import {VariablesDate} from '@app/models/variables-date';
import {Wallet} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {RemoteConfig} from '@app/services/remote-config';
import {ChainId, RatesResponse} from '@app/types';
import {createAsyncTask} from '@app/utils';
import {
  MAINNET_ETH_CHAIN_ID,
  STORE_REHYDRATION_TIMEOUT_MS,
} from '@app/variables/common';

import {Provider} from './provider';

class CurrenciesStore {
  private _selectedCurrency: string = '';
  private _currencies: Record<string, Currency> = {};
  private _rates: Record<ChainId, Record<string, CurrencyRate>> = {};
  private _isInited = false;
  private _prevRatesHash = '';

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        //@ts-ignore
        properties: ['_currencies', '_selectedCurrency'],
        storage,
      }).finally(() => runInAction(() => (this._isInited = true)));
    } else {
      runInAction(() => (this._isInited = true));
    }

    this.fetchCurrencies();
  }

  fetchCurrencies = createAsyncTask(async () => {
    const currencies = await Backend.instance.availableCurrencies();
    if (Array.isArray(currencies)) {
      runInAction(() => {
        this._currencies = currencies.reduce(
          (_prev, _cur) => ({..._prev, [_cur?.id?.toLowerCase()]: _cur}),
          {},
        );
      });
    }
  });

  setRates = (rates: RatesResponse, force: boolean = false) => {
    if (!rates) {
      return;
    }
    // optimization to prevent unnecessary loops while parsing rates
    const ratesHash = hashMessage(JSON.stringify(rates));
    if (this._prevRatesHash === ratesHash && !force) {
      return;
    }
    this._prevRatesHash = ratesHash;

    const ratesMap: Record<
      ChainId,
      Record<string, CurrencyRate>
    > = Object.entries(rates).reduce((prev, [chainId, chainRates]) => {
      return {
        ...prev,
        [chainId]: Object.entries(chainRates).reduce(
          (acc, [tokenKey, fiatRates]) => {
            const rate = fiatRates?.find(
              it =>
                it.denom?.toLowerCase() ===
                this.selectedCurrency?.toLowerCase(),
            );
            return {
              ...acc,
              [tokenKey?.toLocaleLowerCase()]: {
                amount: rate?.amount
                  ? parseFloat(rate.amount) /
                    10 ** Provider.getByEthChainId(chainId)!.decimals
                  : 0,
                denom: rate?.denom,
              } as CurrencyRate,
            };
          },
          {},
        ),
      };
    }, {});

    this._rates = ratesMap;
  };

  get isInited() {
    return this._isInited;
  }

  get currency(): Currency | undefined {
    return this._currencies[this._selectedCurrency?.toLocaleLowerCase()];
  }

  get currencies() {
    return Object.values(this._currencies);
  }

  get isRatesAvailable(): boolean {
    return !!(
      this._getProviderRates() && Object.keys(this._getProviderRates()).length
    );
  }

  get selectedCurrency() {
    return this._selectedCurrency;
  }

  setSelectedCurrency = async (selectedCurrency?: string) => {
    await RemoteConfig.awaitForInitialization();
    await when(() => this.isInited === true);

    if (!selectedCurrency) {
      if (this.selectedCurrency) {
        selectedCurrency = this.selectedCurrency;
      } else {
        selectedCurrency = RemoteConfig.safeGet('currency').id;
      }
    }

    runInAction(() => {
      // Set current currency before any requests
      this._selectedCurrency = selectedCurrency as string;
    });

    // Request rates based on current currency
    await when(() => Wallet.isHydrated, {
      timeout: STORE_REHYDRATION_TIMEOUT_MS,
    });
    const wallets = Wallet.getAllVisible();
    const lastBalanceUpdates =
      VariablesDate.get(`indexer_${Provider.selectedProvider.cosmosChainId}`) ||
      new Date(0);

    let accounts = wallets.map(w => w.cosmosAddress);
    const updates = await Indexer.instance.updates(
      accounts,
      lastBalanceUpdates,
    );

    VariablesDate.set(
      `indexer_${Provider.selectedProvider.cosmosChainId}`,
      new Date(updates.last_update),
    );

    // Update rates
    this.setRates(updates.rates);
  };

  private _getProviderRates = (chainId?: ChainId) =>
    this._rates[
      Provider.isAllNetworks
        ? chainId ?? MAINNET_ETH_CHAIN_ID
        : Provider.selectedProvider.ethChainId
    ];

  convert = (balance: Balance, chainId?: ChainId): Balance => {
    const currencyId = this.selectedCurrency?.toLocaleLowerCase();
    if (!balance || !this._selectedCurrency) {
      return Balance.Empty;
    }

    const providerRates = this._getProviderRates(chainId);
    if (!providerRates) {
      return Balance.Empty;
    }

    const rate =
      providerRates[balance.getSymbol()?.toLocaleLowerCase()]?.amount;
    const currency = this._currencies[currencyId];
    if (!rate || !currency) {
      return Balance.Empty;
    }

    const converted = new Balance(rate, 0).operate(balance, 'mul');
    const result = new Balance(converted, undefined, currency.id);
    return result;
  };

  clear() {
    runInAction(() => {
      this._rates = {};
    });
  }
}

const instance = new CurrenciesStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Currencies};
