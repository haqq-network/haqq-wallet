import {accountInfo, generateEntropy} from '@haqq/provider-web3-utils';
import {
  ProviderBaseOptions,
  ProviderSSSBase,
  StorageInterface,
  constants,
  utils,
} from '@haqq/rn-wallet-providers';
import {
  encryptShare,
  jsonrpcRequest,
  setMetadataValue,
} from '@haqq/shared-react-native';
import BN from 'bn.js';
import EncryptedStorage from 'react-native-encrypted-storage';

import {getMetadataValueWrapped} from '@app/helpers/sss';

export type SharesResponse = {
  isNew: boolean;
  shares: [string, string][];
};

export type ShareCreateResponse = {
  hex_share: string;
};

export async function providerSssInitialize(
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
): Promise<ProviderSSSBase> {
  let keyPK = socialPrivateKey;
  let shares = [];

  if (cloudShare) {
    shares.push(JSON.parse(cloudShare));
  }

  if (socialPrivateKey) {
    const socialShareIndex = await getMetadataValueWrapped(
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

    const p = await utils.Polynomial.initialize(pk, 2);

    for (let i = 0; i < 2; i++) {
      const index = await generateEntropy(16);
      shares.push(p.getShare(index.toString('hex')));
    }
  }

  const poly = await utils.Polynomial.fromShares(shares);

  if (!socialPrivateKey || privateKey) {
    const index = await generateEntropy(16);
    const tmpSocialShare = poly.getShare(index.toString('hex'));

    const p = await utils.Polynomial.initialize(
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

    const newPk = utils.lagrangeInterpolation(
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
      await ProviderSSSBase.setStorageForAccount(
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
    `${constants.ITEM_KEYS[constants.WalletType.sss]}_${address.toLowerCase()}`,
    JSON.stringify(sqStore),
  );

  const accounts = await ProviderSSSBase.getAccounts();

  await EncryptedStorage.setItem(
    `${constants.ITEM_KEYS[constants.WalletType.sss]}_accounts`,
    JSON.stringify(accounts.concat(address.toLowerCase())),
  );

  return new ProviderSSSBase({
    ...options,
    getPassword,
    storage,
    account: address.toLowerCase(),
  });
}
