import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';

export async function onTransactionsLoad(address: string) {
  await Transaction.fetchLatestTransactions(
    Array.from(new Set([...Wallet.addressList(), address])),
    true,
  );
}
