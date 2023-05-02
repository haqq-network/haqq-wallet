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
  console.log('onTransactionCreate 0');
  const txId = Transaction.create(transactionRaw, providerId, fee);

  console.log('onTransactionCreate 1', txId);

  const tx = Transaction.getById(txId);
  if (!tx) {
    return;
  }

  console.log('onTransactionCreate 2');
  const provider = Provider.getProvider(providerId);
  if (!provider) {
    return;
  }
  console.log('onTransactionCreate 3');
  if (!tx.confirmed) {
    try {
      console.log('onTransactionCreate 4');
      const receipt = await provider.rpcProvider.getTransactionReceipt(tx.hash);
      console.log('onTransactionCreate 5');
      if (receipt && receipt.confirmations > 0) {
        console.log('onTransactionCreate 6');
        tx.setConfirmed(receipt);
      }
    } catch (e) {
      captureException(e, 'checkTransaction');
    }
  }

  console.log('onTransactionCreate 7');
  if (tx.to && tx.chainId) {
    console.log('onTransactionCreate 8');
    await awaitForEventDone(
      Events.onAddressBookCreate,
      tx.to.toLowerCase(),
      tx.chainId,
    );
    console.log('onTransactionCreate 9');
    const addressBook = AddressBook.getByAddressAndChainId(tx.to, tx.chainId);
    console.log('onTransactionCreate 10');
    if (addressBook && addressBook.type === AddressBookType.contract) {
      console.log('onTransactionCreate 11');
      await awaitForEventDone(Events.onAddressBookSync, addressBook.id);
    }
  }
}
