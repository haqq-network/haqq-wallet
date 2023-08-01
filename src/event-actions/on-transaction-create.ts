import {BigNumber} from '@ethersproject/bignumber';

import {captureException} from '@app/helpers';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';

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
  fee: number,
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
      const receipt = await provider.rpcProvider.getTransactionReceipt(tx.hash);
      if (receipt && receipt.confirmations > 0) {
        tx.setConfirmed(receipt);
      }
    } catch (e) {
      captureException(e, 'checkTransaction');
    }
  }
}
