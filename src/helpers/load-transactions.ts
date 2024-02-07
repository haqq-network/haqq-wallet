import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';

export async function loadAllTransactions() {
  return Transaction.fetchLatestTransactions(Wallet.addressList());
}
