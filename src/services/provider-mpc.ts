import {ProviderInterface} from '@haqq/provider-base';
import {Provider as ProviderBase} from '@haqq/provider-base/dist/provider';
import {ProviderBaseOptions} from '@haqq/provider-base/src/types';
import {accountInfo} from '@haqq/provider-web3-utils';
import ThresholdKey from '@tkey/default';
import SecurityQuestionsModule from '@tkey/security-questions';
import TorusServiceProvider from '@tkey/service-provider-base';
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

const serviceProvider = new TorusServiceProvider({
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

async function getSeed(account: string) {
  const metadata = await EncryptedStorage.getItem(`${ITEM_KEY}_${account}`);

  if(!metadata) {

  }
}

export class ProviderMpcReactNative
  extends ProviderBase<ProviderMpcOptions>
  implements ProviderInterface {
  static async initialize(
    provider: any,
    getPassword: () => Promise<string>,
    getSecurityQuestionAnswer: () => Promise<string>,
    options: Omit<ProviderBaseOptions, 'getPassword'>,
  ): Promise<ProviderMpcReactNative> {
    const tKey = new ThresholdKey({
      serviceProvider: serviceProvider,
      storageLayer,
      modules: {
        shareTransfer: shareTransferModule,
        shareSerializationModule: shareSerializationModule,
        securityQuestions: securityQuestionsModule,
      },
    });

    customAuthInit();

    const loginDetails = await CustomAuth.triggerLogin(provider);

    tKey.serviceProvider.postboxKey = new BN(loginDetails.privateKey, 16);

    await tKey.initialize();

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
    const password = await getPassword();
    const localQuestionShare =
      await securityQuestionsModule.generateNewShareWithSecurityQuestions(
        password,
        'pin',
      );

    await EncryptedStorage.setItem(
      `${ITEM_SHARE}_${address.toLowerCase()}`,
      JSON.stringify(localQuestionShare),
    );

    const newShare = await tKey.generateNewShare();
    const polyId = tKey.metadata.getLatestPublicPolynomial().getPolynomialID();

    const deviceShare =
      tKey.shares[polyId][newShare.newShareIndex.toString('hex')];

    await EncryptedStorage.setItem(
      `${ITEM_TMP}_${address.toLowerCase()}`,
      JSON.stringify(deviceShare),
    );

    await EncryptedStorage.setItem(
      `${ITEM_KEY}_${address.toLowerCase()}`,
      JSON.stringify(tKey.getMetadata().toJSON()),
    );

    return new ProviderMpcReactNative({
      ...options,
      getPassword,
      account: address.toLowerCase(),
    });
  }
}
