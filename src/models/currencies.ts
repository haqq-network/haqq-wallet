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
import {STORE_REHYDRATION_TIMEOUT_MS} from '@app/variables/common';

class CurrenciesStore {
  private _selectedCurrency: string = '';
  private _currencies: Record<string, Currency> = {};
  private _rates: Record<string, CurrencyRate> = {};
  private _isInited = false;

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
          (_prev, _cur) => ({..._prev, [_cur.id]: _cur}),
          {},
        );
      });
    }
  };

  setRates = (rates: any) => {
    const tokens = Object.keys(rates);

    this._rates = tokens.reduce((prev, token) => {
      const denom = rates[token].find(
        (rate: CurrencyRate) => rate.denom === this._selectedCurrency,
      );
      return {...prev, [token]: denom};
    }, {});
  };

  get isInited() {
    return this._isInited;
  }

  get currency(): Currency | undefined {
    return this._currencies[this._selectedCurrency];
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

  set selectedCurrency(selectedCurrency: string | undefined) {
    if (!selectedCurrency) {
      return;
    }

    const supportedCurrency = Object.values(this._currencies).find(
      currency => currency.id === selectedCurrency,
    );

    if (supportedCurrency) {
      this._selectedCurrency = selectedCurrency;
    } else {
      this._selectedCurrency = 'USD';
    }
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

    // Set current currency before any requests
    runInAction(() => {
      // @ts-ignore
      this._selectedCurrency = selectedCurrency;
    });

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
    const rate = this._rates[balance.getSymbol()]?.amount;
    const currency = this._currencies[this._selectedCurrency];

    if (!rate || !currency) {
      return Balance.Empty;
    }

    //FIXME: Temporary solution. Need to fix Balance tests first
    const result = new Balance(rate).toFloat() * balance.toFloat();
    return new Balance(result, undefined, currency.id);
  };
}

const instance = new CurrenciesStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Currencies};
