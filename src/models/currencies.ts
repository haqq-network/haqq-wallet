import {hashMessage} from '@walletconnect/utils';
import {makeAutoObservable, runInAction, when} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {app} from '@app/contexts';
import {Currency, CurrencyRate} from '@app/models/types';
import {VariablesDate} from '@app/models/variables-date';
import {Wallet} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {RemoteConfig} from '@app/services/remote-config';
import {RatesResponse} from '@app/types';
import {
  STORE_REHYDRATION_TIMEOUT_MS,
  WEI_PRECISION,
} from '@app/variables/common';

// optimization for `convert()` method
const convertedCache = new Map<string, Balance>();
class CurrenciesStore {
  private _selectedCurrency: string = '';
  private _currencies: Record<string, Currency> = {};
  private _rates: Record<string, CurrencyRate> = {};
  private _isInited = false;
  private _prevRatesHash = '';

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        //@ts-ignore
        properties: ['_currencies', '_selectedCurrency'],
        storage: storage,
      }).finally(() => runInAction(() => (this._isInited = true)));
    } else {
      runInAction(() => (this._isInited = true));
    }

    this.fetchCurrencies();
  }

  fetchCurrencies = async () => {
    const currencies = await Backend.instance.availableCurrencies();
    if (Array.isArray(currencies)) {
      runInAction(() => {
        this._currencies = currencies.reduce(
          (_prev, _cur) => ({..._prev, [_cur?.id?.toLowerCase()]: _cur}),
          {},
        );
      });
    }
  };

  setRates = (rates: RatesResponse) => {
    if (!rates) {
      return;
    }
    // optimization to prevent unnecessary loops while parsing rates
    // nedeed because rates are updated inside onWalletsBalanceCheck
    const ratesHash = hashMessage(JSON.stringify(rates));
    if (this._prevRatesHash === ratesHash) {
      return;
    }
    this._prevRatesHash = ratesHash;
    convertedCache.clear();

    const ratesMap: Record<string, CurrencyRate> = Object.entries(rates).reduce(
      (prev, [tokenKey, fiatRates]) => {
        const rate = fiatRates?.find(
          it =>
            it.denom?.toLowerCase() === this.selectedCurrency?.toLowerCase(),
        );
        return {
          ...prev,
          [tokenKey?.toLocaleLowerCase()]: {
            amount: rate?.amount
              ? parseFloat(rate.amount) / 10 ** WEI_PRECISION
              : 0,
            denom: rate?.denom,
          } as CurrencyRate,
        };
      },
      {},
    );

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
    return !!Object.keys(this._rates).length;
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
    convertedCache.clear();

    // Request rates based on current currency
    await when(() => Wallet.isHydrated, {
      timeout: STORE_REHYDRATION_TIMEOUT_MS,
    });
    const wallets = Wallet.getAllVisible();
    const lastBalanceUpdates =
      VariablesDate.get(`indexer_${app.provider.cosmosChainId}`) || new Date(0);

    if (!app.provider.indexer) {
      throw new Error('Indexer is not available');
    }

    let accounts = wallets.map(w => w.cosmosAddress);
    const updates = await Indexer.instance.updates(
      accounts,
      lastBalanceUpdates,
      selectedCurrency,
    );

    VariablesDate.set(
      `indexer_${app.provider.cosmosChainId}`,
      new Date(updates.last_update),
    );

    // Update rates
    this.setRates(updates.rates);
  };

  convert = (balance: Balance): Balance => {
    const currencyId = this.selectedCurrency?.toLocaleLowerCase();
    const serialized = balance.toJsonString();
    const cacheKey = `${serialized}-${app.providerId}-${currencyId}-${this._prevRatesHash}`;

    const cached = convertedCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!balance || !this._selectedCurrency) {
      return Balance.Empty;
    }

    const rate = this._rates[balance.getSymbol()?.toLocaleLowerCase()]?.amount;
    const currency = this._currencies[currencyId];

    if (!rate || !currency) {
      return Balance.Empty;
    }

    const converted = new Balance(rate, 0).operate(balance, 'mul');
    const result = new Balance(converted, undefined, currency.id);
    convertedCache.set(cacheKey, result);
    return result;
  };
}

const instance = new CurrenciesStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Currencies};
