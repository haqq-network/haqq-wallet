import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';

import {app} from '@app/contexts';
import {Wallet} from '@app/models/wallet';
import {TransportHot} from '@app/services/transport-hot';
import {WalletType} from '@app/types';
import {LEDGER_APP} from '@app/variables/common';

const cache = new Map();

export function hasProviderInstanceForWallet(wallet: Wallet) {
  return cache.has(wallet.address);
}

export function abortProviderInstanceForWallet(wallet: Wallet) {
  if (hasProviderInstanceForWallet(wallet)) {
    cache.get(wallet.address).abort();
  }
}

export function getProviderInstanceForWallet(wallet: Wallet) {
  if (!hasProviderInstanceForWallet(wallet)) {
    switch (wallet.type) {
      case WalletType.mnemonic:
      case WalletType.hot:
        cache.set(
          wallet.address,
          new TransportHot({
            cosmosPrefix: 'haqq',
            encryptedData: wallet.data!,
            getPassword: app.getPassword,
          }),
        );
        break;
      case WalletType.ledgerBt:
        cache.set(
          wallet.address,
          new ProviderLedgerReactNative({
            cosmosPrefix: 'haqq',
            deviceId: wallet.deviceId!,
            appName: LEDGER_APP,
          }),
        );
        break;
      default:
        throw new Error('transport_not_implemented');
    }
  }

  return cache.get(wallet.address);
}
