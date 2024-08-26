import {app} from '@app/contexts';
import {Events} from '@app/events';
import {hideModal, showModal} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {EthRpcEndpointAvailability} from '@app/helpers/eth-rpc-endpoint-availability';
import {Currencies} from '@app/models/currencies';
import {Nft} from '@app/models/nft';
import {Provider, RemoteProviderConfig} from '@app/models/provider';
import {Stories} from '@app/models/stories';
import {Token} from '@app/models/tokens';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {ModalType} from '@app/types';
import {createAsyncTask} from '@app/utils';

export const onProviderChanged = createAsyncTask(async () => {
  try {
    showModal(ModalType.loading);

    Nft.clear();
    Token.clear();
    Transaction.clear();
    Currencies.clear();

    await RemoteProviderConfig.init();
    await awaitForEventDone(Events.onSyncAppBalances);
    await awaitForEventDone(Events.onRequestMarkup);
    await Token.fetchTokens(true);
    await Transaction.fetchLatestTransactions(Wallet.addressList(), true);
    await Currencies.fetchCurrencies();

    if (app.provider.config.isNftEnabled) {
      await Nft.fetchNft();
    }
    Provider.fetchProviders();
  } finally {
    hideModal(ModalType.loading);
    app.emit(Events.onProviderChangedFinish);
  }

  await Promise.allSettled([
    Currencies.setSelectedCurrency(),
    awaitForEventDone(Events.onTesterModeChanged, app.isTesterMode),
    EthRpcEndpointAvailability.checkEthRpcEndpointAvailability(),
    Stories.fetch(true),
  ]);
});
