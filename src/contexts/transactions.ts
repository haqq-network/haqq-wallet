import {createContext} from 'react';

import {EventEmitter} from 'events';

import {utils} from 'ethers';

import {app} from '@app/contexts/app';
import {calcFee, captureException} from '@app/helpers';
import {realm} from '@app/models';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';

class Transactions extends EventEmitter {
  private _transactions: Realm.Results<Transaction>;

  constructor() {
    super();
    this.loadTransactionsFromExplorer =
      this.loadTransactionsFromExplorer.bind(this);
    this._transactions = realm.objects<Transaction>('Transaction');

    this._transactions.addListener((collection, changes) => {
      changes.insertions.forEach(index => {
        const transaction = collection[index];

        requestAnimationFrame(async () => {
          await this.checkTransaction(transaction.hash);
        });
      });

      this.emit('transactions');
    });

    app.addListener('addWallet', this.loadTransactionsFromExplorer);
    app.addListener('removeWallet', address => {
      const wallets = realm.objects<Wallet>('Wallet');
      const addressArr = wallets.map(item => item.address);
      const transactions = realm.objects<Transaction>('Transaction');

      const transactionsTo = transactions.filtered(
        `to = '${address.toLowerCase()}'`,
      );
      const transactionsFrom = transactions.filtered(
        `from = '${address.toLowerCase()}'`,
      );

      for (const transaction of transactionsTo) {
        if (!addressArr.includes(transaction.from)) {
          realm.write(() => {
            realm.delete(transaction);
          });
        }
      }
      for (const transaction of transactionsFrom) {
        if (!addressArr.includes(transaction.to)) {
          realm.write(() => {
            realm.delete(transaction);
          });
        }
      }
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

  get transactions() {
    return Array.from(this._transactions ?? []);
  }

  getTransaction(hash: string): Transaction | null {
    return realm.objectForPrimaryKey<Transaction>(
      Transaction.schema.name,
      hash,
    );
  }

  async checkTransaction(hash: string) {
    const transaction = this.getTransaction(hash);

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

  clean() {
    const transactions = realm.objects<Transaction>('Transaction');

    for (const transaction of transactions) {
      realm.write(() => {
        realm.delete(transaction);
      });
    }
  }

  loadTransactionsFromExplorer(address: string) {
    const providers = Provider.getProviders().filter(p => !!p.explorer);

    return Promise.all(
      providers.map(provider =>
        this.loadTransactionsFromExplorerWithProvider(address, provider.id),
      ),
    );
  }

  async loadTransactionsFromExplorerWithProvider(
    address: string,
    providerId: string,
  ) {
    try {
      const p = Provider.getProvider(providerId);
      if (p?.explorer) {
        const txList = await fetch(
          `${p.explorer}api?module=account&action=txlist&address=${address}`,
          {
            headers: {
              accept: 'application/json',
            },
          },
        );

        const rows = await txList.json();

        for (const row of rows.result) {
          try {
            const exists = this.getTransaction(row.hash);
            if (!exists) {
              realm.write(() => {
                realm.create('Transaction', {
                  hash: row.hash,
                  account: address,
                  raw: JSON.stringify(row),
                  createdAt: new Date(parseInt(row.timeStamp, 10) * 1000),
                  from: row.from,
                  to: row.to,
                  value: Number(utils.formatEther(row.value)),
                  fee: calcFee(row.gasPrice, row.gasUsed),
                  confirmed: parseInt(row.confirmations, 10) > 10,
                  providerId,
                });
              });
            }
          } catch (e) {
            captureException(e, 'loadTransactionsFromExplorer transaction', {
              transaction: JSON.stringify(row),
            });
          }
        }
      }
    } catch (e) {
      captureException(e, 'loadTransactionsFromExplorer');
    }
  }
}

export const transactions = new Transactions();

export const TransactionsContext = createContext(transactions);
