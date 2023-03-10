import {
  WEB3AUTH_AUTH0_CLIENT_ID,
  WEB3AUTH_AUTH0_DOMAIN,
  WEB3AUTH_AUTH0_VERIFIER,
  WEB3AUTH_CLIENT_ID,
} from '@env';
import {UnsignedTransaction, serialize} from '@ethersproject/transactions';
import {
  BytesLike,
  ProviderInterface,
  TransactionRequest,
  compressPublicKey,
  hexStringToByteArray,
  joinSignature,
  stringToUtf8Bytes,
} from '@haqq/provider-base';
import {Provider as ProviderBase} from '@haqq/provider-base/dist/provider';
import {ProviderBaseOptions} from '@haqq/provider-base/src/types';
import {
  accountInfo,
  derive,
  generateEntropy,
  generateMnemonicFromEntropy,
  hashMessage,
  seedFromMnemonic,
  sign,
} from '@haqq/provider-web3-utils';
import {Share, ShareStore, ecCurve} from '@tkey/common-types';
import {lagrangeInterpolation} from '@tkey/core';
import ThresholdKey from '@tkey/default';
import SecurityQuestionsModule from '@tkey/security-questions';
import SecurityQuestionsError from '@tkey/security-questions/src/errors';
import SecurityQuestionStore from '@tkey/security-questions/src/SecurityQuestionStore';
import ServiceProvider from '@tkey/service-provider-base';
import {ShareSerializationModule} from '@tkey/share-serialization';
import {ShareTransferModule} from '@tkey/share-transfer';
import TorusStorageLayer from '@tkey/storage-layer-torus';
import CustomAuth from '@toruslabs/customauth-react-native-sdk';
import BN from 'bn.js';
import {hexConcat} from 'ethers/lib/utils';
import EncryptedStorage from 'react-native-encrypted-storage';

import {captureException} from '@app/helpers';

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
  auth0 = 'auth0',
  discord = 'discord',
  coinbase = 'coinase',
  apple = 'apple',
  github = 'github',
}

export interface StorageInterface {
  getItem(key: string): Promise<string | null>;

  hasItem(key: string): Promise<boolean>;

  setItem(key: string, value: string): Promise<boolean>;
}

export const verifierMap = {
  [MpcProviders.google]: {
    name: 'Google',
    verifier: 'haqq-test-google',
    typeOfLogin: 'google',
    clientId:
      '915453653093-22njaj5n8vs0o332485b85iamk0vlt2f.apps.googleusercontent.com',
  },
  [MpcProviders.auth0]: {
    name: 'Auth0',
    typeOfLogin: 'jwt',
    clientId: WEB3AUTH_AUTH0_CLIENT_ID,
    verifier: WEB3AUTH_AUTH0_VERIFIER,
    jwtParams: {
      domain: WEB3AUTH_AUTH0_DOMAIN,
    },
  },
};

export function customAuthInit() {
  CustomAuth.init({
    clientId: WEB3AUTH_CLIENT_ID,
    redirectUri: 'haqq://web3auth/redirect',
    network: 'celeste',
    enableLogging: true,
    enableOneKey: false,
    skipSw: true,
  });
}

async function answerToUserInputHashBN(message: string) {
  const hashed = await hashMessage(message);
  return new BN(hashed, 'hex');
}

async function encryptShare(
  shareStore: ShareStore,
  password: string,
): Promise<SecurityQuestionStore> {
  const hash = await answerToUserInputHashBN(password);
  let nonce = shareStore.share.share.sub(hash);
  nonce = nonce.umod(ecCurve.curve.n);

  return new SecurityQuestionStore({
    nonce,
    questions: '',
    sqPublicShare: shareStore.share.getPublicShare(),
    shareIndex: shareStore.share.shareIndex,
    polynomialID: shareStore.polynomialID,
  });
}

async function decryptShare(
  sqStore: SecurityQuestionStore,
  password: string,
): Promise<ShareStore> {
  const userInputHash = await answerToUserInputHashBN(password);
  let share = sqStore.nonce.add(userInputHash);
  share = share.umod(ecCurve.curve.n);

  const shareStore = new ShareStore(
    new Share(sqStore.shareIndex, share),
    sqStore.polynomialID,
  );

  const derivedPublicShare = shareStore.share.getPublicShare();
  if (
    derivedPublicShare.shareCommitment.x.cmp(
      sqStore.sqPublicShare.shareCommitment.x,
    ) !== 0
  ) {
    throw SecurityQuestionsError.incorrectAnswer();
  }

  return shareStore;
}

async function getSeed(
  account: string,
  storage: StorageInterface,
  getPassword: () => Promise<string>,
) {
  let shares = [];

  const share1 = await EncryptedStorage.getItem(`${ITEM_KEY}_${account}`);

  if (share1) {
    const password = await getPassword();
    const shareStore = await decryptShare(
      SecurityQuestionStore.fromJSON(JSON.parse(share1)),
      password,
    );

    shares.push(shareStore);
  }

  let shareTmp = await EncryptedStorage.getItem(`${ITEM_TMP}_${account}`);

  if (!shareTmp) {
    const content = await storage.getItem(`haqq_${account}`);

    if (content) {
      shareTmp = content;
    }
  }

  if (shareTmp) {
    shares.push(ShareStore.fromJSON(JSON.parse(shareTmp)));
  }

  shares = shares.filter(Boolean);

  const polynomialIDs = new Set(shares.map(s => s.polynomialID));

  if (polynomialIDs.size > 1) {
    throw new Error('polynomialID not equals');
  }

  const privKey = lagrangeInterpolation(
    shares.map(s => new BN(s.share.share, 'hex')),
    shares.map(s => new BN(s.share.shareIndex, 'hex')),
  );

  const mnemonic = await generateMnemonicFromEntropy(privKey.toBuffer());
  const seed = await seedFromMnemonic(mnemonic);
  return {seed};
}

export class ProviderMpcReactNative
  extends ProviderBase<ProviderMpcOptions>
  implements ProviderInterface
{
  static async initialize(
    web3privateKey: string,
    questionAnswer: string | null,
    cloudShare: string | null,
    privateKey: string | null,
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

    tKey.serviceProvider.postboxKey = new BN(web3privateKey, 16);
    await tKey.initialize();

    try {
      if (!questionAnswer && !cloudShare) {
        const bytes = privateKey
          ? Buffer.from(privateKey, 'hex')
          : await generateEntropy(32);

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

      if (questionAnswer) {
        await securityQuestionsModule.inputShareFromSecurityQuestions(
          password as string,
        );
      }

      if (cloudShare) {
        const share = ShareStore.fromJSON(JSON.parse(cloudShare));
        tKey.inputShareStore(share);
      }

      if (questionAnswer || cloudShare) {
        await tKey.reconstructKey();
      }
    } catch (e) {
      if (e instanceof Error) {
        captureException(e, 'provider mpc initialize');
      }
    }

    const {address} = await accountInfo(web3privateKey.padStart(64, '0'));

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

    const [cShare, deviceShare] = applicants;

    await EncryptedStorage.setItem(
      `${ITEM_TMP}_${address.toLowerCase()}`,
      JSON.stringify(cShare.share),
    );

    const pass = await getPassword();

    const sqStore = await encryptShare(
      ShareStore.fromJSON(deviceShare.share),
      pass,
    );

    await EncryptedStorage.setItem(
      `${ITEM_KEY}_${address.toLowerCase()}`,
      JSON.stringify(sqStore.toJSON()),
    );

    const accounts = await ProviderMpcReactNative.getAccounts();

    await EncryptedStorage.setItem(
      `${ITEM_KEY}_accounts`,
      JSON.stringify(accounts.concat(address.toLowerCase())),
    );

    return new ProviderMpcReactNative({
      ...options,
      getPassword,
      storage,
      account: address.toLowerCase(),
    });
  }

  static async getAccounts() {
    const storedKeys = await EncryptedStorage.getItem(`${ITEM_KEY}_accounts`);

    return JSON.parse(storedKeys ?? '[]') as string[];
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
        this._options.getPassword,
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

  async signTransaction(
    hdPath: string,
    transaction: TransactionRequest,
  ): Promise<string> {
    let resp = '';
    try {
      const {seed} = await getSeed(
        this._options.account,
        this._options.storage,
        this._options.getPassword,
      );

      if (!seed) {
        throw new Error('seed_not_found');
      }

      const privateKey = await derive(seed, hdPath);

      if (!privateKey) {
        throw new Error('private_key_not_found');
      }

      const signature = await sign(
        privateKey,
        serialize(transaction as UnsignedTransaction),
      );

      const sig = hexStringToByteArray(signature);

      resp = serialize(transaction as UnsignedTransaction, sig);

      this.emit('signTransaction', true);
    } catch (e) {
      if (e instanceof Error) {
        this.catchError(e, 'signTransaction');
      }
    }

    return resp;
  }

  async signPersonalMessage(
    hdPath: string,
    message: BytesLike | string,
  ): Promise<string> {
    let resp = '';
    try {
      const {seed} = await getSeed(
        this._options.account,
        this._options.storage,
        this._options.getPassword,
      );
      if (!seed) {
        throw new Error('seed_not_found');
      }

      const privateKey = await derive(seed, hdPath);

      if (!privateKey) {
        throw new Error('private_key_not_found');
      }

      const m = Array.from(
        typeof message === 'string' ? stringToUtf8Bytes(message) : message,
      );

      const hash = Buffer.from(
        [
          25, 69, 116, 104, 101, 114, 101, 117, 109, 32, 83, 105, 103, 110, 101,
          100, 32, 77, 101, 115, 115, 97, 103, 101, 58, 10,
        ].concat(stringToUtf8Bytes(String(message.length)), m),
      ).toString('hex');
      const signature = await sign(privateKey, hash);
      resp = '0x' + joinSignature(signature);
      this.emit('signTransaction', true);
    } catch (e) {
      if (e instanceof Error) {
        this.catchError(e, 'signTransaction');
      }
    }

    return resp;
  }

  async signTypedData(
    hdPath: string,
    domainHash: string,
    valueHash: string,
  ): Promise<string> {
    let response = '';
    try {
      const {seed} = await getSeed(
        this._options.account,
        this._options.storage,
        this._options.getPassword,
      );

      if (!seed) {
        throw new Error('seed_not_found');
      }

      const privateKey = await derive(seed, hdPath);

      if (!privateKey) {
        throw new Error('private_key_not_found');
      }

      const concatHash = hexConcat(['0x1901', domainHash, valueHash]);
      response = await sign(privateKey, concatHash);
      this.emit('signTypedData', true);
    } catch (e) {
      if (e instanceof Error) {
        this.catchError(e, 'signTypedData');
      }
    }

    return response;
  }

  async updatePin(pin: string) {
    try {
      const share1 = await EncryptedStorage.getItem(
        `${ITEM_KEY}_${this._options.account.toLowerCase()}`,
      );

      if (share1) {
        const password = await this._options.getPassword();

        const sqStore = SecurityQuestionStore.fromJSON(JSON.parse(share1));

        const share = await decryptShare(sqStore, password);
        const share2 = await encryptShare(share, pin);

        await EncryptedStorage.setItem(
          `${ITEM_KEY}_${this.getIdentifier().toLowerCase()}`,
          JSON.stringify(share2.toJSON()),
        );
      }
    } catch (e) {
      if (e instanceof Error) {
        this.catchError(e, 'updatePin');
      }
    }
  }

  async isShareSaved(): Promise<boolean> {
    const item = await this._options.storage.getItem(
      `haqq_${this._options.account}`,
    );

    if (!item) {
      return false;
    }
    let shareLocal = await EncryptedStorage.getItem(
      `${ITEM_KEY}_${this._options.account}`,
    );
    if (!shareLocal) {
      return false;
    }

    const password = await this._options.getPassword();

    const localShare = await decryptShare(
      SecurityQuestionStore.fromJSON(JSON.parse(shareLocal)),
      password,
    );

    const share = JSON.parse(item);

    return share.polynomialID && share.polynomialID === localShare.polynomialID;
  }

  async tryToSaveShare() {
    let shareTmp = await EncryptedStorage.getItem(
      `${ITEM_TMP}_${this._options.account}`,
    );

    if (shareTmp) {
      await this._options.storage.setItem(
        `haqq_${this._options.account}`,
        shareTmp,
      );

      const file = await this._options.storage.getItem(
        `haqq_${this._options.account}`,
      );

      if (file === shareTmp) {
        await EncryptedStorage.removeItem(
          `${ITEM_TMP}_${this._options.account}`,
        );
      }
    }
  }
}
