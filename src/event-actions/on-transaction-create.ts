import {BigNumber} from '@ethersproject/bignumber';

import {Events} from '@app/events';
import {captureException} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {AddressBook, AddressBookType} from '@app/models/address-book';
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

  const provider = Provider.getProvider(providerId);
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

  if (tx.to && tx.chainId) {
    await awaitForEventDone(
      Events.onAddressBookCreate,
      tx.to.toLowerCase(),
      tx.chainId,
    );

    const addressBook = AddressBook.getByAddressAndChainId(tx.to, tx.chainId);

    if (addressBook && addressBook.type === AddressBookType.contract) {
      await awaitForEventDone(Events.onAddressBookSync, addressBook.id);
    }
  }
}
