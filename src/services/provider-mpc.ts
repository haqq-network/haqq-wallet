import {encrypt} from '@haqq/encryption-react-native';
import {ProviderInterface} from '@haqq/provider-base';
import {Provider as ProviderBase} from '@haqq/provider-base/dist/provider';
import {ProviderBaseOptions} from '@haqq/provider-base/src/types';
import {accountInfo} from '@haqq/provider-web3-utils';
import ThresholdKey from '@tkey/default';
import TorusServiceProvider from '@tkey/service-provider-base';
import {ShareTransferModule} from '@tkey/share-transfer';
import TorusStorageLayer from '@tkey/storage-layer-torus';
import CustomAuth from '@toruslabs/customauth-react-native-sdk';
import BN from 'bn.js';
import randombytes from 'randombytes';
import EncryptedStorage from 'react-native-encrypted-storage';

const GOOGLE = 'google';
const verifierMap = {
  [GOOGLE]: {
    name: 'Google',
    typeOfLogin: 'google',
    clientId:
      '221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com',
    verifier: 'google-lrc',
  },
};

const directParams = {
  baseUrl: 'http://localhost:3000/serviceworker/',
  enableLogging: true,
  network: 'testnet',
};
const serviceProvider = new TorusServiceProvider({
  customAuthArgs: directParams,
} as any);
const storageLayer = new TorusStorageLayer({
  hostUrl: 'https://metadata.tor.us',
});
const shareTransferModule = new ShareTransferModule();

const tKey = new ThresholdKey({
  serviceProvider: serviceProvider,
  storageLayer,
  modules: {shareTransfer: shareTransferModule},
});

CustomAuth.init({
  browserRedirectUri: 'https://scripts.toruswallet.io/redirect.html',
  redirectUri: 'torusapp://com.haqq.wallet/redirect',
  network: 'testnet', // details for test net
  enableLogging: true,
  enableOneKey: false,
});

type ProviderMpcOptions = {
  account: string;
};

export class ProviderMpcReactNative
  extends ProviderBase<ProviderMpcOptions>
  implements ProviderInterface
{
  static async initialize(
    privateKey: string,
    getPassword: () => Promise<string>,
    options: Omit<ProviderBaseOptions, 'getPassword'>,
  ): Promise<ProviderMpcReactNative> {
    const password = await getPassword();

    const key = randombytes(32);

    tKey.serviceProvider.postboxKey = new BN(key);

    const privateData = await encrypt(password, {
      privateKey: key.toString('hex'),
    });

    const {address} = await accountInfo(privateKey);

    await EncryptedStorage.setItem(`mpc_${address.toLowerCase()}`, privateData);

    return new ProviderMpcReactNative({
      ...options,
      getPassword,
      account: address.toLowerCase(),
    });
  }
}
