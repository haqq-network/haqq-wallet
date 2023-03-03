import {ProviderInterface} from '@haqq/provider-base';
import {ProviderHotReactNative} from '@haqq/provider-hot-react-native';
import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';

import {app} from '@app/contexts';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {LEDGER_APP} from '@app/variables/common';

const cache = new Map();

function getId(wallet: Wallet) {
  switch (wallet.type) {
    case WalletType.mnemonic:
    case WalletType.hot:
    case WalletType.ledgerBt:
      return wallet.accountId ?? '';
  }
}

export function hasProviderInstanceForWallet(wallet: Wallet) {
  return cache.has(getId(wallet));
}

export function abortProviderInstanceForWallet(wallet: Wallet) {
  if (hasProviderInstanceForWallet(wallet)) {
    cache.get(getId(wallet)).abort();
  }
}

export function getProviderInstanceForWallet(
  wallet: Wallet,
): ProviderInterface {
  const id = getId(wallet);
  if (!hasProviderInstanceForWallet(wallet)) {
    switch (wallet.type) {
      case WalletType.mnemonic:
        cache.set(
          id,
          new ProviderMnemonicReactNative({
            account: wallet.accountId!,
            getPassword: app.getPassword.bind(app),
          }),
        );
        break;
      case WalletType.hot:
        cache.set(
          id,
          new ProviderHotReactNative({
            getPassword: app.getPassword.bind(app),
            account: wallet.accountId!,
          }),
        );
        break;
      case WalletType.ledgerBt:
        cache.set(
          id,
          new ProviderLedgerReactNative({
            getPassword: app.getPassword.bind(app),
            deviceId: wallet.accountId!,
            appName: LEDGER_APP,
          }),
        );
        break;
      default:
        throw new Error('transport_not_implemented');
    }
  }

  return cache.get(id);
}
