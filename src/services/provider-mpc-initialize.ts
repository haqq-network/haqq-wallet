import {ProviderBaseOptions} from '@haqq/provider-base';
import {
  Polynomial,
  ProviderMpcReactNative,
  StorageInterface,
  lagrangeInterpolation,
} from '@haqq/provider-mpc-react-native';
import {ITEM_KEY} from '@haqq/provider-mpc-react-native/dist/constants';
import {accountInfo, generateEntropy} from '@haqq/provider-web3-utils';
import {
  encryptShare,
  getMetadataValue,
  jsonrpcRequest,
  setMetadataValue,
} from '@haqq/shared-react-native';
import BN from 'bn.js';
import EncryptedStorage from 'react-native-encrypted-storage';

export type SharesResponse = {
  isNew: boolean;
  shares: [string, string][];
};

export type ShareCreateResponse = {
  hex_share: string;
};

export async function providerMpcInitialize(
  socialPrivateKey: string | null,
  cloudShare: string | null,
  privateKey: string | null,
  verifier: string,
  token: string,
  getPassword: () => Promise<string>,
  storage: StorageInterface,
  options: Omit<ProviderBaseOptions, 'getPassword'> & {
    metadataUrl: string;
    generateSharesUrl: string;
  },
): Promise<ProviderMpcReactNative> {
  let keyPK = socialPrivateKey;
  let shares = [];

  if (cloudShare) {
    shares.push(JSON.parse(cloudShare));
  }

  if (socialPrivateKey) {
    console.log('socialPrivateKey', socialPrivateKey);
    const socialShareIndex = await getMetadataValue(
      options.metadataUrl,
      socialPrivateKey,
      'socialShareIndex',
    );

    if (socialShareIndex) {
      shares.push({
        ...socialShareIndex,
        share: socialPrivateKey,
      });
    }
  }

  if (shares.length < 2 || privateKey) {
    const pk = privateKey
      ? Buffer.from(privateKey, 'hex')
      : await generateEntropy(32);

    const p = await Polynomial.initialize(pk, 2);

    for (let i = 0; i < 2; i++) {
      const index = await generateEntropy(16);
      shares.push(p.getShare(index.toString('hex')));
    }
  }

  const poly = await Polynomial.fromShares(shares);

  if (!socialPrivateKey || privateKey) {
    const index = await generateEntropy(16);
    const tmpSocialShare = poly.getShare(index.toString('hex'));

    const p = await Polynomial.initialize(
      new BN(tmpSocialShare.share, 'hex'),
      3,
    );

    const nodeDetailsRequest = await jsonrpcRequest<SharesResponse>(
      options.generateSharesUrl,
      'shares',
      [verifier, token, true],
    );

    const tmpPk = await generateEntropy(32);
    const info = await accountInfo(tmpPk.toString('hex'));
    let sharesTmp = await Promise.all(
      nodeDetailsRequest.shares.map(s =>
        jsonrpcRequest<ShareCreateResponse>(s[0], 'shareCreate', [
          verifier,
          token,
          info.publicKey,
          p.getShare(s[1]).share,
        ])
          .then(r => [r.hex_share, s[1]])
          .catch(() => [null, s[1]]),
      ),
    );

    const sharesTmp2 = sharesTmp.filter(s => s[0] !== null) as [
      string,
      string,
    ][];

    if (sharesTmp2.length < 2) {
      throw new Error('not enough shares');
    }

    const newPk = lagrangeInterpolation(
      sharesTmp2.map(s => new BN(s[0], 'hex')),
      sharesTmp2.map(s => new BN(s[1], 'hex')),
    );

    if (newPk.toString('hex') !== tmpSocialShare.share) {
      throw new Error('Something went wrong');
    }

    keyPK = newPk.toString('hex');

    const {share, ...shareIndex} = tmpSocialShare;

    await setMetadataValue(
      options.metadataUrl,
      share,
      'socialShareIndex',
      shareIndex,
    );
  }

  if (keyPK === null) {
    throw new Error('keyPK is null');
  }

  const {address} = await accountInfo(keyPK);

  if (!cloudShare) {
    const index = await generateEntropy(16);
    const tmpCloudShare = poly.getShare(index.toString('hex'));

    const stored = await storage.setItem(
      `haqq_${address.toLowerCase()}`,
      JSON.stringify(tmpCloudShare),
    );

    if (stored) {
      await ProviderMpcReactNative.setStorageForAccount(
        address.toLowerCase(),
        storage,
      );
    }
  }

  const deviceShareIndex = await generateEntropy(16);
  const deviceShare = poly.getShare(deviceShareIndex.toString('hex'));

  const pass = await getPassword();

  const sqStore = await encryptShare(deviceShare, pass);

  await EncryptedStorage.setItem(
    `${ITEM_KEY}_${address.toLowerCase()}`,
    JSON.stringify(sqStore),
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
