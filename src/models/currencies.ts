import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {Currency, CurrencyRate} from '@app/models/types';
import {Backend} from '@app/services/backend';
import {Balance} from '@app/services/balance';
import {storage} from '@app/services/mmkv';

class CurrenciesStore {
  private _selectedCurrency: string = '';
  private _currencies: Record<string, Currency> = {};
  private _rates: Record<string, CurrencyRate> = {};

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        //@ts-ignore
        properties: ['_currencies', '_selectedCurrency'],
        storage: storage,
      });
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

  setRates = async (rates: any) => {
    const tokens = Object.keys(rates);

    this._rates = tokens.reduce((prev, token) => {
      const denom = rates[token].find(
        (rate: CurrencyRate) => rate.denom === this._selectedCurrency,
      );
      return {...prev, [token]: denom};
    }, {});
  };

  get currency(): Currency | undefined {
    return this._currencies[this._selectedCurrency];
  }

  get currencies() {
    return Object.values(this._currencies);
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

  convert = (balance: Balance): Balance | null => {
    const rate = this._rates[balance.getSymbol()]?.amount;
    const currency = this._currencies[this._selectedCurrency];

    if (!rate) {
      return null;
    }
    //FIXME: Temporary solution. Need to fix Balance tests first
    const result = new Balance(rate).toFloat() * balance.toFloat();
    return new Balance(result, undefined, currency.id);
  };
}

const instance = new CurrenciesStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Currencies};
