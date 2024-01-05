import {makeAutoObservable} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {Balance} from '@app/services/balance';
import {storage} from '@app/services/mmkv';
import {Fiat, RatesResponse} from '@app/types';

type Rates = Record<string, Partial<Record<Fiat, number>>>;

class ExchangeRates {
  private rates: Rates = {};
  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        //@ts-ignore
        properties: ['rates'],
        storage: storage,
      });
    }
  }

  get isHydrated() {
    return isHydrated(this);
  }

  update = (response: RatesResponse) => {
    if (!response) {
      return;
    }
    const rates = response;
    const tokens = Object.keys(rates);

    const result: Rates = tokens.reduce((prev, token) => {
      const denoms = rates[token].reduce((_prev, _cur) => {
        return {..._prev, [_cur.denom]: _cur.amount};
      }, {});
      return {...prev, [token]: denoms};
    }, {});

    this.rates = result;
  };

  private getSymbol = (fiat: Fiat) => {
    switch (fiat) {
      case 'USD':
        return '$';
      default:
        return fiat.toUpperCase();
    }
  };

  convert = (balance: Balance, fiat: Fiat): Balance => {
    const rate = this.rates?.[balance.currency]?.[fiat];
    if (!rate) {
      return Balance.Empty;
    }
    //FIXME: Temporary solution. Need to fix Balance tests first
    const result = new Balance(rate).toFloat() * balance.toFloat();
    return new Balance(result, undefined, this.getSymbol(fiat));
  };
}

const instance = new ExchangeRates(Boolean(process.env.JEST_WORKER_ID));
export {instance as ExchangeRates};
