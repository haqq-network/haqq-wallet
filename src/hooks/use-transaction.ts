import {useCallback, useEffect, useRef} from 'react';

import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {Provider} from '@app/models/provider';
import {Transaction, TransactionStatus} from '@app/models/transaction';

export const useTransaction = (txHash: string) => {
  const tx = Transaction.getById(txHash);
  const txUpdateTimeout = useRef<ReturnType<typeof setTimeout>>();

  /**
   * @name checkTransactionReceipt
   * @description Check transaction receipt and update transaction confirmed status
   */
  const checkTransactionReceipt = useCallback(async () => {
    if (tx && !tx.confirmed) {
      try {
        const provider = Provider.getById(tx.providerId);

        if (provider) {
          const rpcProvider = await getRpcProvider(provider);

          const receipt = await rpcProvider.getTransactionReceipt(tx.hash);
          if (receipt && receipt.confirmations > 0) {
            Transaction.setConfirmed(tx.hash, receipt);
          }
        }
      } catch (e) {
        Logger.captureException(e, 'checkTransaction');
      }
    }
  }, [tx]);

  /**
   * @name loadTransactionInfo
   * @description Check, load and update transaction status when transaction still in progress
   * @return {Promise<void>}
   */
  const loadTransactionInfo = useCallback(async () => {
    if (tx?.status === TransactionStatus.inProgress) {
      // Wait while transaction status will be updated
      await awaitForEventDone(Events.onTransactionStatusLoad, tx.hash);
      // Get updated transaction for status checks
      const updatedTx = Transaction.getById(tx.hash);
      // If fetched status still in progress
      if (updatedTx?.status === TransactionStatus.inProgress) {
        // Run new timer and check transaction status after 5 sec delay
        txUpdateTimeout.current = setTimeout(loadTransactionInfo, 5000);
      }
    }
  }, [tx]);

  useEffect(() => {
    loadTransactionInfo();
    checkTransactionReceipt();

    return () => {
      clearTimeout(txUpdateTimeout.current);
      txUpdateTimeout.current = undefined;
    };
  }, [loadTransactionInfo, checkTransactionReceipt]);

  return tx;
};
