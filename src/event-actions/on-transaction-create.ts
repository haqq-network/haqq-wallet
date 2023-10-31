import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';
import {Balance} from '@app/services/balance';

export async function onTransactionCreate(
  transactionRaw: Transaction,
  providerId: string,
  fee: Balance,
) {
  const tx = Transaction.create(transactionRaw, providerId, fee);

  const provider = Provider.getById(providerId);
  if (!provider) {
    return;
  }

  if (!tx.confirmed) {
    try {
      const rpcProvider = await getRpcProvider(provider);

      const receipt = await rpcProvider.getTransactionReceipt(tx.hash);
      if (receipt && receipt.confirmations > 0) {
        Transaction.setConfirmed(tx.hash, receipt);
      }
    } catch (e) {
      Logger.captureException(e, 'checkTransaction');
    }
  }
}
