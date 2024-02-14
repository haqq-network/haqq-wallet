import {app} from '@app/contexts';
import {getExplorerInstanceForProvider} from '@app/helpers/explorer-instance';
import {Transaction} from '@app/models/transaction';
import {IndexerTransactionStatus} from '@app/types';

export async function onTransactionStatusLoad(txHash: string) {
  const tx = Transaction.getById(txHash);
  if (tx) {
    const txStatus = await loadStatus(tx);

    Transaction.update(tx.hash, {...tx, code: txStatus});
  }
}

/**
 * @name loadStatus
 * @description Fetch receipt status and transaction status and check it
 * @return {Promise<TransactionStatus>}
 */
const loadStatus = async (tx: Transaction) => {
  try {
    if (tx) {
      const explorer = getExplorerInstanceForProvider(app.providerId);
      const receipt = await explorer.transactionReceiptStatus(tx.hash);
      const status = await explorer.transactionStatus(tx.hash);

      if (!receipt.result) {
        return getTransactionStatus('0', '0');
      }
      if (!status.result) {
        return getTransactionStatus(receipt.result.status, '0');
      }

      return getTransactionStatus(receipt.result.status, status.result.isError);
    }

    return IndexerTransactionStatus.inProgress;
  } catch (e) {
    Logger.captureException(e, 'loadTransactionsFromExplorer');
    return IndexerTransactionStatus.inProgress;
  }
};

/**
 * @name getTransactionStatus
 * @description Decide which status transaction has based on receipt status and error status
 * @param {string} receiptStatus 0 | 1
 * @param {string} errorStatus 0 | 1
 * @return {TransactionStatus}
 */
const getTransactionStatus = (
  receiptStatus: '0' | '1',
  errorStatus: '0' | '1',
): IndexerTransactionStatus => {
  if (receiptStatus === '0') {
    return IndexerTransactionStatus.inProgress;
  }
  if (errorStatus === '0') {
    return IndexerTransactionStatus.success;
  }
  return IndexerTransactionStatus.failed;
};
