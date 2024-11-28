import {providers} from '@haqq/rn-wallet-providers';

import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/sss';
import {Provider} from '@app/models/provider';
import {IWalletModel} from '@app/models/wallet';
import {NetworkProviderTypes} from '@app/services/backend';
import {LEDGER_APP} from '@app/variables/common';

import {awaitForQRSign} from '../await-for-qr-sign';

/**
 * Factory class for creating different types of providers based on wallet and network.
 */
export class ProviderFactory {
  /**
   * Creates a mnemonic provider based on the wallet and network.
   * @param {IWalletModel} wallet - The wallet model.
   * @param {Provider} [network=Provider.selectedProvider] - The network provider.
   * @returns {Promise<providers.ProviderMnemonicEvm | providers.ProviderMnemonicTron>} A promise that resolves to the appropriate mnemonic provider.
   * @throws {Error} If the network type is not supported.
   */
  static async getMnemonicProvider(
    wallet: IWalletModel,
    network = Provider.selectedProvider,
  ) {
    const baseConfig = {
      account: wallet.accountId!,
      getPassword: app.getPassword.bind(app),
    };

    switch (network.networkType) {
      case NetworkProviderTypes.EVM:
      case NetworkProviderTypes.HAQQ:
        return new providers.ProviderMnemonicEvm(baseConfig);
      case NetworkProviderTypes.TRON:
        return new providers.ProviderMnemonicTron({
          ...baseConfig,
          tronWebHostUrl: network.ethRpcEndpoint,
        });
      default:
        throw new Error('transport_not_implemented');
    }
  }

  /**
   * Creates a hot provider based on the wallet and network.
   * @param {IWalletModel} wallet - The wallet model.
   * @param {Provider} [network=Provider.selectedProvider] - The network provider.
   * @returns {Promise<providers.ProviderHotEvm>} A promise that resolves to the appropriate hot provider.
   * @throws {Error} If the network type is not supported.
   */
  static async getHotProvider(
    wallet: IWalletModel,
    network = Provider.selectedProvider,
  ) {
    switch (network.networkType) {
      case NetworkProviderTypes.EVM:
      case NetworkProviderTypes.HAQQ:
        return new providers.ProviderHotEvm({
          account: wallet.accountId!,
          getPassword: app.getPassword.bind(app),
        });
      case NetworkProviderTypes.TRON:
        return new providers.ProviderHotTron({
          account: wallet.accountId!,
          getPassword: app.getPassword.bind(app),
          tronWebHostUrl: network.ethRpcEndpoint,
        });
      default:
        throw new Error('transport_not_implemented');
    }
  }

  /**
   * Creates a Ledger provider based on the wallet and network.
   * @param {IWalletModel} wallet - The wallet model.
   * @param {Provider} [network=Provider.selectedProvider] - The network provider.
   * @returns {Promise<providers.ProviderLedgerEvm>} A promise that resolves to the appropriate Ledger provider.
   * @throws {Error} If the network type is not supported.
   */
  static async getLedgerProvider(
    wallet: IWalletModel,
    network = Provider.selectedProvider,
  ) {
    switch (network.networkType) {
      case NetworkProviderTypes.EVM:
      case NetworkProviderTypes.HAQQ:
        return new providers.ProviderLedgerEvm({
          getPassword: app.getPassword.bind(app),
          deviceId: wallet.accountId!,
          appName: LEDGER_APP,
        });
      // TODO: add tron provider
      case NetworkProviderTypes.TRON:
      default:
        throw new Error('transport_not_implemented');
    }
  }

  /**
   * Creates an SSS (Social Security System) provider based on the wallet and network.
   * @param {IWalletModel} wallet - The wallet model.
   * @param {Provider} [network=Provider.selectedProvider] - The network provider.
   * @returns {Promise<providers.ProviderSSSEvm>} A promise that resolves to the appropriate SSS provider.
   * @throws {Error} If the network type is not supported.
   */
  static async getSSSProvider(
    wallet: IWalletModel,
    network = Provider.selectedProvider,
  ) {
    const storage = await getProviderStorage(wallet.accountId as string);
    switch (network.networkType) {
      case NetworkProviderTypes.EVM:
      case NetworkProviderTypes.HAQQ:
        return new providers.ProviderSSSEvm({
          storage,
          account: wallet.accountId!,
          getPassword: app.getPassword.bind(app),
        });
      case NetworkProviderTypes.TRON:
        return new providers.ProviderSSSTron({
          storage,
          account: wallet.accountId!,
          getPassword: app.getPassword.bind(app),
          tronWebHostUrl: network.ethRpcEndpoint,
        });
      default:
        throw new Error('transport_not_implemented');
    }
  }

  /**
   * Creates a Keystone provider based on the wallet and network.
   * @param {IWalletModel} wallet - The wallet model.
   * @param {Provider} [network=Provider.selectedProvider] - The network provider.
   * @returns {Promise<providers.ProviderKeystoneEvm>} A promise that resolves to the appropriate Keystone provider.
   * @throws {Error} If the network type is not supported.
   */
  static async getKeystoneProvider(
    wallet: IWalletModel,
    network = Provider.selectedProvider,
  ) {
    switch (network.networkType) {
      case NetworkProviderTypes.EVM:
      case NetworkProviderTypes.HAQQ:
        return new providers.ProviderKeystoneEvm({
          qrCBORHex: wallet.accountId!,
          awaitForSign: async params => {
            const signatureHex = await awaitForQRSign(params);
            return {signatureHex};
          },
        });
      // TODO: add tron provider
      case NetworkProviderTypes.TRON:
      default:
        throw new Error('transport_not_implemented');
    }
  }
}
