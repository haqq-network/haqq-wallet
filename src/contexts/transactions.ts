import {createContext} from 'react';

import {EventEmitter} from 'events';

import {TransactionEvents} from '@app/events';
import {captureException} from '@app/helpers';

import {realm} from '../models';
import {Provider} from '../models/provider';
import {Transaction} from '../models/transaction';

class Transactions extends EventEmitter<TransactionEvents> {
  private _transactions: Realm.Results<Transaction>;

  constructor() {
    super();
    this._transactions = realm.objects<Transaction>(Transaction.schema.name);

    this._transactions.addListener((collection, changes) => {
      changes.insertions.forEach(index => {
        const transaction = collection[index];

        requestAnimationFrame(async () => {
          await this.checkTransaction(transaction.hash);
        });
      });

      this.emit('transactions');
    });
  }

  async init(): Promise<void> {
    Promise.all(
      Array.from(this._transactions)
        .filter(t => !t.confirmed)
        .map(row => this.checkTransaction(row.hash)),
    );

    this.emit('transactions');
  }

  async checkTransaction(hash: string) {
    const transaction = Transaction.getById(hash);

    if (transaction) {
      try {
        const provider = Provider.getProvider(transaction.providerId);

        if (provider) {
          const receipt = await provider.rpcProvider.getTransactionReceipt(
            transaction.hash,
          );
          if (receipt && receipt.confirmations > 0) {
            transaction.setConfirmed(receipt);
          }
        }
      } catch (e) {
        captureException(e, 'checkTransaction');
      }
    }
  }
}

export const transactions = new Transactions();

export const TransactionsContext = createContext(transactions);
