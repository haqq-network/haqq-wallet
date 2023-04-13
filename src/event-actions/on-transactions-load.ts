import {calcFee, captureException} from '@app/helpers';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';

export async function onTransactionsLoad(
  address: string,
  callback?: () => void,
) {
  const providers = Provider.getProviders().filter(p => !!p.explorer);

  await Promise.all(
    providers.map(provider =>
      loadTransactionsFromExplorerWithProvider(address, provider.id),
    ),
  );

  if (callback) {
    callback();
  }
}

async function loadTransactionsFromExplorerWithProvider(
  address: string,
  providerId: string,
) {
  try {
    const p = Provider.getProvider(providerId);
    if (p?.explorer) {
      const txList = await fetch(
        `${p.explorer}api?module=account&action=txlist&address=${address}`,
        {
          headers: {
            accept: 'application/json',
          },
        },
      );

      const rows = await txList.json();

      for (const row of rows.result) {
        console.log(
          'loadTransactionsFromExplorer',
          providerId,
          address,
          JSON.stringify(row),
        );
        Transaction.create(row, providerId, calcFee(row.gasPrice, row.gasUsed));
      }
    }
  } catch (e) {
    captureException(e, 'loadTransactionsFromExplorer');
  }
}
