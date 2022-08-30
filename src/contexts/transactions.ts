import {EventEmitter} from 'events';
import {createContext, useContext} from 'react';
import {getChainId, getDefaultNetwork} from '../network';
import {BigNumberish, utils} from 'ethers';
import {wallets} from './wallets';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import {realm} from '../models';
import {TransactionType} from '../models/transaction';
import {Deferrable} from '@ethersproject/properties';

class Transactions extends EventEmitter {
  private transactions: Realm.Results<TransactionType> | undefined;

  async init(): Promise<void> {
    this.transactions = await realm.objects<TransactionType>('Transaction');

    for (const row of this.transactions) {
      if (!row.confirmed) {
        const receipt = await getDefaultNetwork().getTransactionReceipt(
          row.hash,
        );
        if (receipt.confirmations > 0) {
          realm.write(() => {
            row.confirmed = true;
            row.fee = calcFee(
              receipt.cumulativeGasUsed,
              receipt.effectiveGasPrice,
            );
          });
        }
      }
    }
  }

  getTransactions(account: string) {
    if (!this.transactions) {
      return [];
    }

    return Array.from(this.transactions.filtered(`account = '${account}'`));
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
    const wallet = wallets.getWallet(from);
    if (wallet) {
      await wallet.wallet.connect(getDefaultNetwork());

      const transaction = await wallet.wallet.sendTransaction({
        to,
        value: utils.parseEther(amount.toString()),
        chainId: getChainId(),
      });

      await this.saveTransaction(transaction, from, to, amount);

      return transaction;
    }

    return null;
  }

  async estimateTransaction(from: string, to: string, amount: number) {
    const result = await Promise.all([
      getDefaultNetwork().getFeeData(),
      getDefaultNetwork().estimateGas({
        from,
        to,
        amount,
      } as Deferrable<TransactionRequest>),
    ]);

    return calcFee(result[0].maxFeePerGas!, result[1]);
  }
}

function calcFee(gasPrice: BigNumberish, gasUsed: BigNumberish): number {
  return (
    Number(utils.formatEther(gasPrice)) *
    Number(utils.formatEther(gasUsed)) *
    1000000000000000000
  );
}

export const transactions = new Transactions();

export const TransactionsContext = createContext(transactions);

export function useTransactions() {
  const context = useContext(TransactionsContext);

  return context;
}
