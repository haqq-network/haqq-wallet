import {Events} from '@app/events';
import {calcFee} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {getExplorerInstanceForProvider} from '@app/helpers/explorer-instance';
import {Provider} from '@app/models/provider';
import {TransactionStatus} from '@app/models/transaction';
import {Balance} from '@app/services/balance';
import {ExplorerTransaction} from '@app/types';

export async function onTransactionsLoad(address: string) {
  const providers = Provider.getAll().filter(p => !!p.explorer);

  const rows = (
    await Promise.all(
      providers.map(provider =>
        loadTransactionsFromExplorerWithProvider(address, provider.id),
      ),
    )
  )
    .flat()
    .sort((a, b) => b.timeStamp - a.timeStamp)
    .slice(0, 30);

  for (const row of rows) {
    await awaitForEventDone(
      Events.onTransactionCreate,
      row.row,
      row.providerId,
      new Balance(row.fee),
    );
  }
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

    return rows.result.map(row => ({
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

const getTransactionStatus = (tx: ExplorerTransaction): TransactionStatus => {
  if (tx.txreceipt_status === '0') {
    return TransactionStatus.inProgress;
  }
  if (tx.isError === '0') {
    return TransactionStatus.success;
  }
  return TransactionStatus.failed;
};
