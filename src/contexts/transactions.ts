import {EventEmitter} from 'events';
import {createContext, useContext} from 'react';
import {getDefaultNetwork} from '../network';
import {utils} from 'ethers';
import {wallets} from './wallets';
import {TransactionResponse} from '@ethersproject/abstract-provider';
import {realm} from '../models';
import {Transaction} from '../models/transaction';

class Transactions extends EventEmitter {
  private transactions: Realm.Results<Transaction & Realm.Object>;

  async init(): Promise<void> {
    this.transactions = await realm.objects<Transaction>('Transaction');

    for (const row of this.transactions) {
      if (row.confirmed === false) {
        const receipt = await getDefaultNetwork().getTransactionReceipt(
          row.hash,
        );
        if (receipt.confirmations > 0) {
          realm.write(() => {
            row.confirmed = true;
            row.fee =
              Number(utils.formatEther(receipt.cumulativeGasUsed)) *
              Number(utils.formatEther(receipt.effectiveGasPrice)) *
              1000000000000000000;
          });
        }
      }
    }
  }

  async getTransactions(account: string) {
    return this.transactions.filtered(`account = '${account}'`);
  }

  async saveTransaction(
    raw: TransactionResponse,
    from: string,
    to: string,
    amount: number,
  ) {
    realm.write(() => {
      realm.create('Transaction', {
        hash: raw.hash,
        account: from,
        raw: JSON.stringify(raw),
        createdAt: new Date(),
        from,
        to,
        value: amount,
        fee: 0,
        confirmed: false,
      });
    });
  }

  async sendTransaction(from: string, to: string, amount: number) {
    const provider = getDefaultNetwork();
    const wallet = wallets.getWallet(from);
    if (wallet) {
      await wallet.connect(provider);

      const transaction = await wallet.sendTransaction({
        to,
        value: utils.parseEther(amount.toString()),
        chainId: provider.chainId,
      });

      console.log(transaction);

      await this.saveTransaction(transaction, from, to, amount);

      return transaction;
    }

    return null;
  }
}

export const transactions = new Transactions();

export const TransactionsContext = createContext(transactions);

export function useTransactions() {
  const context = useContext(TransactionsContext);

  return context;
}
