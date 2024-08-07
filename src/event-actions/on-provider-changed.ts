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

export async function onProviderChanged() {
  try {
    showModal(ModalType.loading);
    // necessary operation loading
    await Promise.allSettled([
      awaitForEventDone(Events.onSyncAppBalances),
      Token.fetchTokens(true),
      Nft.fetchNft(),
      RemoteProviderConfig.init(),
      Transaction.fetchLatestTransactions(Wallet.addressList(), true),
      Currencies.fetchCurrencies(),
      Provider.fetchProviders(),
    ]);
  } finally {
    hideModal(ModalType.loading);
  }

  await Promise.allSettled([
    Currencies.setSelectedCurrency(),
    awaitForEventDone(Events.onTesterModeChanged, app.isTesterMode),
    EthRpcEndpointAvailability.checkEthRpcEndpointAvailability(),
    Stories.fetch(true),
  ]);
}
