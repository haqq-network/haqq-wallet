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

class ProviderWrapper implements ProviderInterface {
  constructor(private provider: ProviderInterface) {
    this.provider = provider;
  }

  getIdentifier: () => string = () => {
    return this.provider.getIdentifier();
  };

  getAccountInfo: (
    hdPath: string,
  ) => Promise<{publicKey: string; address: string}> = hdPath => {
    return this.provider.getAccountInfo(hdPath);
  };

  getPrivateKey: (hdPath: string) => Promise<string> = hdPath => {
    return this.provider.getPrivateKey(hdPath);
  };

  signTransaction: (
    hdPath: string,
    transaction: TransactionRequest,
  ) => Promise<string> = async (hdPath, transaction) => {
    const result = await this.provider.signTransaction(hdPath, transaction);
    const wallet = await this.provider.getAccountInfo(hdPath);
    EventTracker.instance.trackEvent(MarketingEvents.signTransaction, wallet);
    return result;
  };

  signPersonalMessage: (hdPath: string, message: BytesLike) => Promise<string> =
    async (hdPath, message) => {
      const result = await this.provider.signPersonalMessage(hdPath, message);
      const wallet = await this.provider.getAccountInfo(hdPath);
      EventTracker.instance.trackEvent(
        MarketingEvents.signPersonalMessage,
        wallet,
      );
      return result;
    };

  signTypedData: (hdPath: string, typedData: TypedData) => Promise<string> =
    async (hdPath, typedData) => {
      const result = await this.provider.signTypedData(hdPath, typedData);
      const wallet = await this.provider.getAccountInfo(hdPath);
      EventTracker.instance.trackEvent(MarketingEvents.signTypedData, wallet);
      return result;
    };

  abort: () => void = () => {
    this.provider.abort();
  };

  updatePin: (pin: string) => Promise<void> = pin => {
    return this.provider.updatePin(pin);
  };

  clean: () => Promise<void> = () => {
    return this.provider.clean();
  };

  /**
   * EVENT EMITTER METHODS
   */

  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    this.provider.on(eventName, listener);
    return this;
  }

  once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    this.provider.once(eventName, listener);
    return this;
  }

  off(eventName: string | symbol, listener: (...args: any[]) => void): this {
    this.provider.off(eventName, listener);
    return this;
  }

  addListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    this.provider.addListener(eventName, listener);
    return this;
  }

  removeAllListeners(event?: string | symbol | undefined): this {
    this.provider.removeAllListeners(event);
    return this;
  }

  removeListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    this.provider.removeListener(eventName, listener);
    return this;
  }

  emit(eventName: string | symbol, ...args: any[]): boolean {
    return this.provider.emit(eventName, ...args);
  }

  eventNames(): (string | symbol)[] {
    return this.provider.eventNames();
  }

  getMaxListeners(): number {
    return this.provider.getMaxListeners();
  }

  listenerCount(eventName: string | symbol): number {
    return this.provider.listenerCount(eventName);
  }

  listeners(eventName: string | symbol): Function[] {
    return this.provider.listeners(eventName);
  }

  prependListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    this.provider.prependListener(eventName, listener);
    return this;
  }

  prependOnceListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    this.provider.prependOnceListener(eventName, listener);
    return this;
  }

  rawListeners(eventName: string | symbol): Function[] {
    return this.provider.rawListeners(eventName);
  }

  setMaxListeners(n: number): this {
    this.provider.setMaxListeners(n);
    return this;
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
  return new ProviderWrapper(provider);
}
