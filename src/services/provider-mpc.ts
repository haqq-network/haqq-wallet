import {ProviderInterface, compressPublicKey} from '@haqq/provider-base';
import {Provider as ProviderBase} from '@haqq/provider-base/dist/provider';
import {ProviderBaseOptions} from '@haqq/provider-base/src/types';
import {
  accountInfo,
  derive,
  generateMnemonicFromEntropy,
  seedFromMnemonic,
} from '@haqq/provider-web3-utils';
import {Metadata, lagrangeInterpolation} from '@tkey/core';
import ThresholdKey from '@tkey/default';
import SecurityQuestionsModule from '@tkey/security-questions';
import ServiceProvider from '@tkey/service-provider-base';
import {ShareSerializationModule} from '@tkey/share-serialization';
import {ShareTransferModule} from '@tkey/share-transfer';
import TorusStorageLayer from '@tkey/storage-layer-torus';
import CustomAuth from '@toruslabs/customauth-react-native-sdk';
import BN from 'bn.js';
import randombytes from 'randombytes';
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
};

const ITEM_SHARE = 'mpc_share';
const ITEM_TMP = 'mpc_tmp';
const ITEM_KEY = 'mpc';

function customAuthInit() {
  CustomAuth.init({
    browserRedirectUri: 'https://scripts.toruswallet.io/redirect.html',
    redirectUri: 'torusapp://org.torusresearch.customauthexample/redirect',
    network: 'celeste', // details for test net
    enableLogging: true,
    enableOneKey: false,
    skipSw: true,
  });
}

async function getTKey(account: string, provider: any) {
  const tKey = new ThresholdKey({
    serviceProvider: serviceProvider,
    storageLayer,
    modules: {
      shareTransfer: shareTransferModule,
      shareSerializationModule: shareSerializationModule,
      securityQuestions: securityQuestionsModule,
    },
  });

  const metadata = await EncryptedStorage.getItem(`${ITEM_KEY}_${account}`);

  if (!metadata) {
    customAuthInit();
    const loginDetails = await CustomAuth.triggerLogin(provider);
    tKey.serviceProvider.postboxKey = new BN(loginDetails.privateKey, 16);
  } else {
    tKey.metadata = Metadata.fromJSON(JSON.parse(metadata));
  }

  await tKey.initialize();

  return tKey;
}

async function getSeed(account: string) {
  const share1 = await EncryptedStorage.getItem(`${ITEM_TMP}_${account}`);
  const share2 = await EncryptedStorage.getItem(`${ITEM_SHARE}_${account}`);

  const shares = [share1, share2]
    .filter(Boolean)
    .map(r => JSON.parse(r as string));

  const privKey = lagrangeInterpolation(
    shares.map(s => new BN(s.share.share, 'hex')),
    shares.map(s => new BN(s.share.shareIndex, 'hex')),
  );

  const mnemonic = await generateMnemonicFromEntropy(privKey.toBuffer());
  console.log('mnemonic', mnemonic);
  const seed = await seedFromMnemonic(mnemonic);

  return {seed};
}

export class ProviderMpcReactNative
  extends ProviderBase<ProviderMpcOptions>
  implements ProviderInterface
{
  static async initialize(
    provider: any,
    getPassword: () => Promise<string>,
    getSecurityQuestionAnswer: () => Promise<string>,
    options: Omit<ProviderBaseOptions, 'getPassword'>,
  ): Promise<ProviderMpcReactNative> {
    const tKey = await getTKey('', provider);

    const answerString = await getSecurityQuestionAnswer();

    await securityQuestionsModule.inputShareFromSecurityQuestions(answerString);

    let key;

    try {
      const resp = await tKey.reconstructKey();
      key = resp.privKey;
    } catch (e) {
      key = new BN(randombytes(32));
    }

    const privateKey = key.toString('hex');

    const {address} = await accountInfo(privateKey);

    const newShare = await tKey.generateNewShare();
    const polyId = tKey.metadata.getLatestPublicPolynomial().getPolynomialID();

    const deviceShare =
      tKey.shares[polyId][newShare.newShareIndex.toString('hex')];

    await EncryptedStorage.setItem(
      `${ITEM_TMP}_${address.toLowerCase()}`,
      JSON.stringify(deviceShare),
    );

    const newShare2 = await tKey.generateNewShare();

    const deviceShare2 =
      tKey.shares[polyId][newShare2.newShareIndex.toString('hex')];

    await EncryptedStorage.setItem(
      `${ITEM_KEY}_${address.toLowerCase()}`,
      JSON.stringify(deviceShare2),
    );

    return new ProviderMpcReactNative({
      ...options,
      getPassword,
      account: address.toLowerCase(),
    });
  }

  async getAccountInfo(hdPath: string) {
    let resp = {publicKey: '', address: ''};
    try {
      const {seed} = await getSeed(this._options.account);

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
}
