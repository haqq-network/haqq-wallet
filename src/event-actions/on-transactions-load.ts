import {Events} from '@app/events';
import {calcFee, captureException} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';

export async function onTransactionsLoad(address: string) {
  const providers = Provider.getProviders().filter(p => !!p.explorer);

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
      row.fee,
    );
  }
}

async function loadTransactionsFromExplorerWithProvider(
  address: string,
  providerId: string,
) {
  try {
    const p = Provider.getProvider(providerId);

    if (!p?.explorer) {
      return [];
    }

    const txList = await fetch(
      `${p.explorer}api?module=account&action=txlist&address=${address}`,
      {
        headers: {
          accept: 'application/json',
        },
      },
    );

    const rows = await txList.json();

    return rows.result
      .filter((row: any) => !Transaction.getById(row.hash))
      .map((row: any) => ({
        row: {...row, chainId: String(p?.ethChainId)},
        providerId,
        fee: calcFee(row.gasPrice, row.gasUsed),
        timeStamp: Number(row.timeStamp),
      }));
  } catch (e) {
    captureException(e, 'loadTransactionsFromExplorer');
    return [];
  }
}
