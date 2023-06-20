import {captureException} from '@app/helpers';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';

export async function onTransactionCheck(hash: string) {
  const transaction = Transaction.getById(hash);

  if (transaction && !transaction.confirmed) {
    try {
      const provider = Provider.getById(transaction.providerId);

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
