import {ProviderBaseError, ProviderInterface} from '@haqq/provider-base';
import {ProviderHotReactNative} from '@haqq/provider-hot-react-native';
import {ProviderKeystoneReactNative} from '@haqq/provider-keystone-react-native';
import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {app} from '@app/contexts';
import {awaitForLedger} from '@app/helpers/await-for-ledger';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {LEDGER_APP} from '@app/variables/common';

import {awaitForQRSign} from './await-for-qr-sign';

const cache = new Map();

function getId(wallet: Wallet) {
  switch (wallet.type) {
    case WalletType.mnemonic:
    case WalletType.hot:
    case WalletType.ledgerBt:
    case WalletType.sss:
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

export function removeProviderInstanceForWallet(wallet: Wallet) {
  let id = getId(wallet);
  let instance = cache.get(id);
  if (instance) {
    instance.abort();
    instance = null;
    cache.delete(id);
  }
}

/**
 * getProviderInstanceForWallet helper
 * @param {Wallet} wallet
 * @param {boolean} [skipAwaitForLedgerCall=false] Use `true` for synthetic transaction on Ledger. Default is `false`.
 */
export async function getProviderInstanceForWallet(
  wallet: Wallet,
  skipAwaitForLedgerCall: boolean = false,
  forceUpdate: boolean = false,
): Promise<ProviderInterface> {
  const id = getId(wallet);

  if (cache.has(id) && !forceUpdate) {
    return cache.get(id);
  }

  let provider: ProviderInterface;
  switch (wallet.type) {
    case WalletType.mnemonic:
      provider = new ProviderMnemonicReactNative({
        account: wallet.accountId!,
        getPassword: app.getPassword.bind(app),
      });
      break;
    case WalletType.hot:
      provider = new ProviderHotReactNative({
        getPassword: app.getPassword.bind(app),
        account: wallet.accountId!,
      });
      break;
    case WalletType.ledgerBt: {
      provider = new ProviderLedgerReactNative({
        getPassword: app.getPassword.bind(app),
        deviceId: wallet.accountId!,
        appName: LEDGER_APP,
      });
      if (!skipAwaitForLedgerCall) {
        awaitForLedger(provider);
        cache.set(id, provider);
      }
      break;
    }
    case WalletType.sss:
      const storage = await getProviderStorage(wallet.accountId as string);
      provider = new ProviderSSSReactNative({
        storage,
        getPassword: app.getPassword.bind(app),
        account: wallet.accountId!,
      });
      break;
    case WalletType.keystone:
      provider = new ProviderKeystoneReactNative({
        qrCBORHex: wallet.accountId!,
        awaitForSign: async params => {
          const signatureHex = await awaitForQRSign(params);
          return {signatureHex};
        },
      });
      break;
    default:
      throw new Error('transport_not_implemented');
  }
  provider.on('catch-error', ({error, source}: ProviderBaseError) => {
    if (error) {
      Logger.captureException(error, 'provider-catch-error', {
        wallet,
        skipAwaitForLedgerCall,
        forceUpdate,
        source: source,
        error: error,
      });
    }
  });
  cache.set(id, provider);
  return provider;
}
