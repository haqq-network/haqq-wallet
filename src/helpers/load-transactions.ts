import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {Wallet} from '@app/models/wallet';

export const loadAllTransactions = () =>
  Promise.allSettled(
    Wallet.getAllVisible().map(wallet =>
      awaitForEventDone(Events.onTransactionsLoad, wallet.address),
    ),
  );
