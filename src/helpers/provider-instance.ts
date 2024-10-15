import {
  BytesLike,
  ProviderBaseError,
  ProviderInterface,
  ProviderKeystoneEvm,
  ProviderLedgerEvm,
  TransactionRequest,
  TypedData,
  providers,
} from '@haqq/rn-wallet-providers';

import {app} from '@app/contexts';
import {awaitForLedger} from '@app/helpers/await-for-ledger';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {Provider} from '@app/models/provider';
import {IWalletModel} from '@app/models/wallet';
import {NetworkProviderTypes} from '@app/services/backend';
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
        network: Provider.selectedProvider.name,
        chainId: `${Provider.selectedProvider.ethChainId}`,
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
        network: Provider.selectedProvider.name,
        chainId: `${Provider.selectedProvider.ethChainId}`,
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
        network: Provider.selectedProvider.name,
        chainId: `${Provider.selectedProvider.ethChainId}`,
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
 * @param {IWalletModel} wallet
 * @param {boolean} [skipAwaitForLedgerCall=false] Use `true` for synthetic transaction on Ledger. Default is `false`.
 */
export async function getProviderInstanceForWallet(
  wallet: IWalletModel,
  skipAwaitForLedgerCall: boolean = false,
  network = Provider.selectedProvider,
): Promise<ProviderInterface> {
  let provider: ProviderInterface;

  let blockchainType: 'Base' | 'Evm' | 'Tron' = 'Base';
  switch (network.networkType) {
    case NetworkProviderTypes.EVM:
    case NetworkProviderTypes.HAQQ:
      blockchainType = 'Evm';
      break;
    case NetworkProviderTypes.TRON:
      blockchainType = 'Tron';
      break;
  }

  switch (wallet.type) {
    case WalletType.mnemonic:
      const ProviderMnemonic = providers[
        `ProviderMnemonic${blockchainType}`
      ] as typeof providers.ProviderMnemonicBase;

      provider = new ProviderMnemonic({
        account: wallet.accountId!,
        getPassword: app.getPassword.bind(app),
      });
      break;
    case WalletType.hot:
      // TODO: add tron provider
      // const ProviderHot = providers[
      //   `ProviderHot${blockchainType}`
      // ] as typeof providers.ProviderHotBase;
      const ProviderHot = providers.ProviderHotEvm;

      provider = new ProviderHot({
        getPassword: app.getPassword.bind(app),
        account: wallet.accountId!,
      });
      break;
    case WalletType.ledgerBt: {
      // TODO: add tron provider
      // const ProviderLedger = providers[
      //   `ProviderLedger${blockchainType}`
      // ] as typeof providers.ProviderLedgerEvm;

      provider = new ProviderLedgerEvm({
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
      // TODO: add tron provider
      // const ProviderSSS = providers[
      //   `ProviderSSS${blockchainType}`
      // ] as typeof providers.ProviderSSSBase;
      const ProviderSSS = providers.ProviderSSSEvm;

      provider = new ProviderSSS({
        storage,
        getPassword: app.getPassword.bind(app),
        account: wallet.accountId!,
      });
      break;
    case WalletType.keystone:
      // const ProviderKeystone = providers[
      //   `ProviderKeystone${blockchainType}`
      // ] as typeof providers.ProviderKeystoneBase;

      provider = new ProviderKeystoneEvm({
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
