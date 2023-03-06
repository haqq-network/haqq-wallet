import {ProviderInterface, compressPublicKey} from '@haqq/provider-base';
import {Provider as ProviderBase} from '@haqq/provider-base/dist/provider';
import {ProviderBaseOptions} from '@haqq/provider-base/src/types';
import {
  accountInfo,
  derive,
  generateEntropy,
  generateMnemonicFromEntropy,
  seedFromMnemonic,
} from '@haqq/provider-web3-utils';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {lagrangeInterpolation} from '@tkey/core';
import ThresholdKey from '@tkey/default';
import SecurityQuestionsModule from '@tkey/security-questions';
import ServiceProvider from '@tkey/service-provider-base';
import {ShareSerializationModule} from '@tkey/share-serialization';
import {ShareTransferModule} from '@tkey/share-transfer';
import TorusStorageLayer from '@tkey/storage-layer-torus';
import CustomAuth from '@toruslabs/customauth-react-native-sdk';
import BN from 'bn.js';
import EncryptedStorage from 'react-native-encrypted-storage';

const directParams = {
  baseUrl: 'http://localhost:3000/serviceworker/',
  enableLogging: true,
  network: 'testnet',
};

const serviceProvider = new ServiceProvider({
  customAuthArgs: directParams,
} as any);

const storageLayer = new TorusStorageLayer({
  hostUrl: 'https://metadata.tor.us',
});

const shareTransferModule = new ShareTransferModule();
const shareSerializationModule = new ShareSerializationModule();
const securityQuestionsModule = new SecurityQuestionsModule();

type ProviderMpcOptions = {
  account: string;
  getPassword: () => Promise<string>;
  storage: StorageInterface;
};

const ITEM_TMP = 'mpc_tmp';
const ITEM_KEY = 'mpc';

export enum MpcProviders {
  google = 'google',
  github = 'github',
}

export interface StorageInterface {
  getItem(key: string): Promise<string>;

  hasItem(key: string): Promise<boolean>;

  setItem(key: string, value: string): Promise<boolean>;
}

export const verifierMap = {
  [MpcProviders.google]: {
    name: 'Google',
    // verifier: 'haqq-dev',
    verifier: 'haqq-test-google',
    typeOfLogin: 'google',
    clientId:
      '915453653093-22njaj5n8vs0o332485b85iamk0vlt2f.apps.googleusercontent.com',
    // clientId: 'WHNzKg3jJMNbeG60SIKTq9ibHuPVry2E',
    // jwtParams: {
    //   domain: 'https://dev-fo21axxzwy36n42g.eu.auth0.com/',
    //   verifierIdField: 'email',
    //   isVerifierIdCaseSensitive: 'false',
    // },
  },
  [MpcProviders.github]: {
    name: 'Github',
    typeOfLogin: 'jwt',
    clientId: 'WHNzKg3jJMNbeG60SIKTq9ibHuPVry2E',
    verifier: 'haqq-test-auth0-github',
    jwtParams: {
      domain: 'dev-fo21axxzwy36n42g.eu.auth0.com',
    },
  },
};

export function customAuthInit() {
  CustomAuth.init({
    clientId:
      'BGMlNKbZTkgecZ3g_eGgwxUS4dLy2CAWuHIJsyAVuP7GR841maSzWqepnlZBRZpau8W8pNvbfMd93AIJRIZsxE4',
    // browserRedirectUri: 'https://scripts.toruswallet.io/redirect.html',
    redirectUri: 'haqq://web3auth/redirect',
    network: 'testnet',
    enableLogging: true,
    enableOneKey: false,
    skipSw: true,
  });
}

export async function getGoogleTokens() {
  try {
    await GoogleSignin.signInSilently();
  } catch (e) {
    await GoogleSignin.signIn();
  }

  return await GoogleSignin.getTokens();
}

async function getSeed(account: string, storage: StorageInterface) {
  const share1 = await EncryptedStorage.getItem(`${ITEM_KEY}_${account}`);

  let shareTmp = await EncryptedStorage.getItem(`${ITEM_TMP}_${account}`);

  if (!shareTmp) {
    const content = await storage.getItem(`haqq_${account}`);

    if (content) {
      shareTmp = content;
    }
  }

  const shares = [share1, shareTmp]
    .filter(Boolean)
    .map(r => JSON.parse(r as string));

  console.log('seed shares', account, JSON.stringify(shares));

  const privKey = lagrangeInterpolation(
    shares.map(s => new BN(s.share.share, 'hex')),
    shares.map(s => new BN(s.share.shareIndex, 'hex')),
  );

  console.log('privKey', privKey);

  const mnemonic = await generateMnemonicFromEntropy(privKey.toBuffer());
  const seed = await seedFromMnemonic(mnemonic);
  return {seed};
}

export class ProviderMpcReactNative
  extends ProviderBase<ProviderMpcOptions>
  implements ProviderInterface
{
  static async initialize(
    privateKey: string,
    questionAnswer: string | null,
    getPassword: () => Promise<string>,
    storage: StorageInterface,
    options: Omit<ProviderBaseOptions, 'getPassword'>,
  ): Promise<ProviderMpcReactNative> {
    let password = questionAnswer;

    const tKey = new ThresholdKey({
      serviceProvider: serviceProvider,
      storageLayer,
      modules: {
        shareTransfer: shareTransferModule,
        shareSerializationModule: shareSerializationModule,
        securityQuestions: securityQuestionsModule,
      },
    });

    tKey.serviceProvider.postboxKey = new BN(privateKey, 16);
    await tKey.initialize();

    let key;

    try {
      if (!questionAnswer) {
        const bytes = await generateEntropy(32);

        await tKey._initializeNewKey({
          initializeModules: true,
          importedKey: new BN(bytes),
        });

        password = await getPassword();

        await securityQuestionsModule.generateNewShareWithSecurityQuestions(
          password,
          'whats your password?',
        );
      }

      await securityQuestionsModule.inputShareFromSecurityQuestions(
        password as string,
      );

      const resp = await tKey.reconstructKey();
      key = resp.privKey;
    } catch (e) {
      if (e instanceof Error) {
        console.log('pk error', e, e.message);
      }
      const bytes = await generateEntropy(32);

      key = new BN(bytes);
    }

    const {address} = await accountInfo(key.toString('hex').padStart(64, '0'));

    console.log(
      'shares all',
      address,
      JSON.stringify(
        tKey.getAllShareStoresForLatestPolynomial().map(s => s.toJSON()),
      ),
    );

    while (tKey.getAllShareStoresForLatestPolynomial().length < 5) {
      await tKey.generateNewShare();
    }

    const rootShareIndex = new BN(1);

    const applicants = tKey
      .getAllShareStoresForLatestPolynomial()
      .filter(s => s.share.shareIndex !== rootShareIndex)
      .map(s => ({
        key: Math.random(),
        share: s,
      }));

    applicants.sort((a, b) => a.key - b.key);

    const [deviceShare, deviceShare2] = applicants;

    await EncryptedStorage.setItem(
      `${ITEM_TMP}_${address.toLowerCase()}`,
      JSON.stringify(deviceShare.share),
    );

    await EncryptedStorage.setItem(
      `${ITEM_KEY}_${address.toLowerCase()}`,
      JSON.stringify(deviceShare2.share),
    );

    return new ProviderMpcReactNative({
      ...options,
      getPassword,
      storage,
      account: address.toLowerCase(),
    });
  }

  getIdentifier() {
    return this._options.account;
  }

  async getAccountInfo(hdPath: string) {
    let resp = {publicKey: '', address: ''};
    try {
      const {seed} = await getSeed(
        this._options.account,
        this._options.storage,
      );

      if (!seed) {
        throw new Error('seed_not_found');
      }

      const privateKey = await derive(seed, hdPath);

      if (!privateKey) {
        throw new Error('private_key_not_found');
      }

      const account = await accountInfo(privateKey);

      resp = {
        publicKey: compressPublicKey(account.publicKey),
        address: account.address,
      };
      this.emit('getPublicKeyForHDPath', true);
    } catch (e) {
      if (e instanceof Error) {
        this.catchError(e, 'getPublicKeyForHDPath');
      }
    }
    return resp;
  }

  async isShareSaved(): Promise<boolean> {
    return this._options.storage.hasItem(`haqq_${this._options.account}`);
  }

  async tryToSaveShare() {
    let shareTmp = await EncryptedStorage.getItem(
      `${ITEM_TMP}_${this._options.account}`,
    );

    console.log('shareTmp', shareTmp);

    if (shareTmp) {
      await this._options.storage.setItem(
        `haqq_${this._options.account}`,
        shareTmp,
      );

      const file = await this._options.storage.getItem(
        `haqq_${this._options.account}`,
      );

      console.log('file', file);

      if (file === shareTmp) {
        await EncryptedStorage.removeItem(
          `${ITEM_TMP}_${this._options.account}`,
        );
      }
    }
  }
}
