import {createContext} from 'react';

import {EventEmitter} from 'events';

import {realm} from '../models';
import {Transaction} from '../models/transaction';

class Transactions extends EventEmitter {
  private _transactions: Realm.Results<Transaction>;

  constructor() {
    super();
    this._transactions = realm.objects<Transaction>(Transaction.schema.name);

    this._transactions.addListener(() => {
      this.emit('transactions');
    });
  }

  async init(): Promise<void> {
    this.emit('transactions');
  }
}

export const transactions = new Transactions();

export const TransactionsContext = createContext(transactions);
