import {utils} from 'ethers';

import {calcFee, captureException} from '@app/helpers';
import {realm} from '@app/models';
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
        const exists = Transaction.getById(row.hash);
        if (!exists) {
          realm.write(() => {
            realm.create(Transaction.schema.name, {
              hash: row.hash,
              account: address,
              raw: JSON.stringify(row),
              createdAt: new Date(parseInt(row.timeStamp, 10) * 1000),
              from: row.from,
              to: row.to,
              value: Number(utils.formatEther(row.value)),
              fee: calcFee(row.gasPrice, row.gasUsed),
              confirmed: parseInt(row.confirmations, 10) > 10,
              providerId,
            });
          });
        }
      }
    }
  } catch (e) {
    captureException(e, 'loadTransactionsFromExplorer');
  }
}
