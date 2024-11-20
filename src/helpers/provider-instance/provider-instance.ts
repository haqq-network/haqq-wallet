import {
  ProviderBase,
  ProviderBaseError,
  ProviderInterface,
} from '@haqq/rn-wallet-providers';

import {awaitForLedger} from '@app/helpers/await-for-ledger';
import {Provider} from '@app/models/provider';
import {IWalletModel} from '@app/models/wallet';
import {WalletType} from '@app/types';

import {wrapWalletProvider} from './provider-event-tracker-wrapper';
import {ProviderFactory} from './provider-factory';

const providersFactory = {
  [WalletType.mnemonic]: ProviderFactory.getMnemonicProvider,
  [WalletType.hot]: ProviderFactory.getHotProvider,
  [WalletType.ledgerBt]: ProviderFactory.getLedgerProvider,
  [WalletType.sss]: ProviderFactory.getSSSProvider,
  [WalletType.keystone]: ProviderFactory.getKeystoneProvider,
  [WalletType.watchOnly]: () =>
    new ProviderBase({getPassword: () => Promise.resolve('')}),
};

/**
 * getProviderInstanceForWallet helper
 * @param {IWalletModel} wallet
 * @param {boolean} [skipAwaitForLedgerCall=false] Use `true` for synthetic transaction on Ledger. Default is `false`.
 */
export async function getProviderInstanceForWallet(
  wallet: IWalletModel,
  skipAwaitForLedgerCall: boolean = false,
  network = Provider.selectedProvider,
): Promise<ProviderInterface> {
  const createProvider = providersFactory[wallet.type];
  if (!createProvider) {
    throw new Error('transport_not_implemented');
  }

  const provider = await createProvider(wallet, network);

  if (wallet.type === WalletType.ledgerBt && !skipAwaitForLedgerCall) {
    awaitForLedger(provider);
  }

  provider.on('catch-error', ({error, source}: ProviderBaseError) => {
    if (error) {
      Logger.captureException(error, 'provider-catch-error', {
        wallet,
        skipAwaitForLedgerCall,
        source: source,
        error: error,
      });
    }
  });

  return wrapWalletProvider(provider);
}
