import {BigNumber} from '@ethersproject/bignumber';

import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';
import {Balance} from '@app/services/balance';

export async function onTransactionCreate(
  transactionRaw: {
    hash: string;
    block?: string;
    from: string;
    to?: string;
    chainId: string | number;
    value: BigNumber;
    timeStamp?: number | string;
    confirmations?: number | string;
    contractAddress?: string;
  },
  providerId: string,
  fee: Balance,
) {
  const txId = Transaction.create(transactionRaw, providerId, fee);

  const tx = Transaction.getById(txId);
  if (!tx) {
    return;
  }

  const provider = Provider.getById(providerId);
  if (!provider) {
    return;
  }

  if (!tx.confirmed) {
    try {
      const rpcProvider = await getRpcProvider(provider);

      const receipt = await rpcProvider.getTransactionReceipt(tx.hash);
      if (receipt && receipt.confirmations > 0) {
        tx.setConfirmed(receipt);
      }
    } catch (e) {
      Logger.captureException(e, 'checkTransaction');
    }
  }
}
