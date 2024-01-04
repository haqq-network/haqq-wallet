import {makeAutoObservable} from 'mobx';

import {Balance} from '@app/services/balance';
import {Fiat, RatesResponse} from '@app/types';

type Rates = Record<string, Partial<Record<Fiat, number>>>;

class ExchangeRates {
  private rates: Rates = {};
  constructor() {
    makeAutoObservable(this);
  }

  update = (response: RatesResponse) => {
    if (!response || !response?.rates) {
      return;
    }
    const rates = response.rates;
    const tokens = Object.keys(rates);

    const result: Rates = tokens.reduce((prev, token) => {
      const denoms = rates[token].reduce((_prev, _cur) => {
        return {..._prev, [_cur.denom]: _cur.amount};
      }, {});
      return {...prev, [token]: denoms};
    }, {});

    this.rates = result;
  };

  convert = (balance: Balance, fiat: Fiat): Balance => {
    const rate = this.rates?.[balance.currency]?.[fiat]?.toString();
    if (!rate) {
      return Balance.Empty;
    }
    return balance.operate(new Balance(rate), 'mul');
  };
}

const instance = new ExchangeRates();
export {instance as ExchangeRates};
