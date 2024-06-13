import {calcFee} from '@app/helpers';
import {getExplorerInstanceForProvider} from '@app/helpers/explorer-instance';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';
import {ExplorerTransaction, IndexerTransactionStatus} from '@app/types';

export async function onTransactionsLoad(address: string) {
  const providers = Provider.getAll().filter(p => !!p.explorer);

  await Promise.all(
    providers.map(provider =>
      loadTransactionsFromExplorerWithProvider(address, provider.id),
    ),
  );
}

async function loadTransactionsFromExplorerWithProvider(
  address: string,
  providerId: string,
) {
  try {
    const p = Provider.getById(providerId);
    const explorer = getExplorerInstanceForProvider(providerId);
    const rows = await explorer.accountTxList(address);

    if (!rows.result) {
      return [];
    }

    return rows.result
      .filter(row => {
        const tx = Transaction.getById(row.hash);
        if (!tx) {
          return true;
        }
        return tx.code !== getTransactionStatus(row);
      })
      .map(row => ({
        row: {
          ...row,
          chainId: String(p?.ethChainId),
          status: getTransactionStatus(row),
        },
        providerId,
        fee: calcFee(row.gasPrice, row.gasUsed),
        timeStamp: Number(row.timeStamp),
      }));
  } catch (e) {
    Logger.captureException(e, 'loadTransactionsFromExplorer');
    return [];
  }
}

const getTransactionStatus = (
  tx: ExplorerTransaction,
): IndexerTransactionStatus => {
  if (tx.txreceipt_status === '0') {
    return IndexerTransactionStatus.inProgress;
  }
  if (tx.isError === '0') {
    return IndexerTransactionStatus.success;
  }
  return IndexerTransactionStatus.failed;
};
