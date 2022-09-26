import {EventEmitter} from 'events';
import {createContext, useContext} from 'react';
import {getChainId, getDefaultNetwork} from '../network';
import {BigNumberish, utils} from 'ethers';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import {realm} from '../models';
import {TransactionType} from '../models/transaction';
import {Deferrable} from '@ethersproject/properties';
import {Wallet} from '../models/wallet';

class Transactions extends EventEmitter {
  private _transactions: Realm.Results<TransactionType>;

  constructor() {
    super();
    this._transactions = realm.objects<TransactionType>('Transaction');
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

  async saveTransaction(
    raw: TransactionResponse,
    from: string,
    to: string,
    amount: number,
    estimateFee: number,
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
        fee: estimateFee,
        confirmed: false,
      });
    });

    this._transactions = realm.objects<TransactionType>('Transaction');
    this.emit('transactions');
  }

  getTransaction(hash: string): TransactionType | null {
    const transactions = realm.objects<TransactionType>('Transaction');
    const transaction = transactions.filtered(`hash = '${hash}'`);

    if (!transaction.length) {
      return null;
    }

    return transaction[0];
  }

  async checkTransaction(hash: string) {
    const local = this.getTransaction(hash);

    if (local) {
      try {
        const receipt = await getDefaultNetwork().getTransactionReceipt(
          local.hash,
        );
        if (receipt && receipt.confirmations > 0) {
          realm.write(() => {
            local.confirmed = true;
            local.fee = calcFee(
              receipt.cumulativeGasUsed,
              receipt.effectiveGasPrice,
            );
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          console.log('sendTransaction', e.message);
        }
      }
    }
  }

  async sendTransaction(
    from: string,
    to: string,
    amount: number,
    estimateFee: number,
    wallet: Wallet,
  ) {
    const transaction = await wallet.sendTransaction({
      to,
      value: utils.parseEther(amount.toString()),
      chainId: getChainId(),
    });

    if (!transaction) {
      return null;
    }

    await this.saveTransaction(transaction, from, to, amount, estimateFee);

    requestAnimationFrame(async () => {
      await this.checkTransaction(transaction.hash);
    });

    return transaction;
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
