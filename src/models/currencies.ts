import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {Currency} from '@app/models/types';
import {Backend} from '@app/services/backend';
import {storage} from '@app/services/mmkv';

class CurrenciesStore {
  private _currencies: Currency[] = [];
  private _selectedCurrency: string = 'USD';

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
  }

  fetch = async () => {
    const currencies = await Backend.instance.availableCurrencies();
    if (Array.isArray(currencies)) {
      runInAction(() => {
        this._currencies = currencies;
      });
    }
  };

  get currencies() {
    return this._currencies;
  }

  get selectedCurrency() {
    return this._selectedCurrency;
  }

  set selectedCurrency(selectedCurrency: string) {
    this._selectedCurrency = selectedCurrency;
  }
}

const instance = new CurrenciesStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Currencies};
