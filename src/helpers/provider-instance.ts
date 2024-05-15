import {
  BytesLike,
  ProviderBaseError,
  ProviderInterface,
  TransactionRequest,
  TypedData,
} from '@haqq/provider-base';
import {ProviderHotReactNative} from '@haqq/provider-hot-react-native';
import {ProviderKeystoneReactNative} from '@haqq/provider-keystone-react-native';
import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {app} from '@app/contexts';
import {awaitForLedger} from '@app/helpers/await-for-ledger';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {Wallet} from '@app/models/wallet';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents, WalletType} from '@app/types';
import {LEDGER_APP} from '@app/variables/common';

import {awaitForQRSign} from './await-for-qr-sign';

function getProviderWrapper(provider: ProviderInterface) {
  const signTransactionOriginal = provider.signTransaction.bind(provider);
  const signPersonalMessageOriginal =
    provider.signPersonalMessage.bind(provider);
  const signTypedDataOriginal = provider.signTypedData.bind(provider);

  const wrapped = {
    async signTransaction(
      hdPath: string,
      transaction: TransactionRequest,
    ): Promise<string> {
      const params = {
        type: 'signTransaction',
        network: app.provider.name,
        chainId: `${app.provider.ethChainId}`,
      };
      try {
        EventTracker.instance.trackEvent(MarketingEvents.signTxStart, params);
        const result = await signTransactionOriginal(hdPath, transaction);
        const wallet = await provider.getAccountInfo(hdPath);
        EventTracker.instance.trackEvent(MarketingEvents.signTxSuccess, {
          ...wallet,
          ...params,
        });
        return result;
      } catch (error) {
        EventTracker.instance.trackEvent(MarketingEvents.signTxFail, params);
        throw error;
      }
    },
    async signPersonalMessage(
      hdPath: string,
      message: BytesLike,
    ): Promise<string> {
      const params = {
        type: 'signPersonalMessage',
        network: app.provider.name,
        chainId: `${app.provider.ethChainId}`,
      };
      try {
        EventTracker.instance.trackEvent(MarketingEvents.signTxFail, params);
        const result = await signPersonalMessageOriginal(hdPath, message);
        const wallet = await provider.getAccountInfo(hdPath);
        EventTracker.instance.trackEvent(MarketingEvents.signTxSuccess, {
          ...wallet,
          ...params,
        });
        return result;
      } catch (error) {
        EventTracker.instance.trackEvent(MarketingEvents.signTxFail, params);
        throw error;
      }
    },
    async signTypedData(hdPath: string, typedData: TypedData): Promise<string> {
      const params = {
        type: 'signTypedData',
        network: app.provider.name,
        chainId: `${app.provider.ethChainId}`,
      };
      try {
        EventTracker.instance.trackEvent(MarketingEvents.signTxStart, params);
        const result = await signTypedDataOriginal(hdPath, typedData);
        const wallet = await provider.getAccountInfo(hdPath);
        EventTracker.instance.trackEvent(MarketingEvents.signTxSuccess, {
          ...wallet,
          ...params,
        });
        return result;
      } catch (error) {
        EventTracker.instance.trackEvent(MarketingEvents.signTxFail, params);
        throw error;
      }
    },
  };

  return Object.assign(provider, wrapped) as unknown as ProviderInterface;
}

/**
 * getProviderInstanceForWallet helper
 * @param {Wallet} wallet
 * @param {boolean} [skipAwaitForLedgerCall=false] Use `true` for synthetic transaction on Ledger. Default is `false`.
 */
export async function getProviderInstanceForWallet(
  wallet: Wallet,
  skipAwaitForLedgerCall: boolean = false,
): Promise<ProviderInterface> {
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
        source: source,
        error: error,
      });
    }
  });

  return getProviderWrapper(provider);
}
