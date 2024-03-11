import {device} from 'detox';
import {Wallet, utils} from 'ethers';

import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {restorePrivateKey} from './helpers/restorePrivateKey';
import {restoreWallet} from './helpers/restoreWallet';
import {PIN} from './test-variables';

describe('Signin', () => {
  let mnemonic = '';
  let privateKey = '';
  let privateKeyMnemonic = '';

  const resetApp = async () => {
    await device.reloadReactNative();
    await element(by.id('forgot_the_code')).tap();
    await element(by.id('reset_wallet')).tap();
    await element(by.label('Reset')).atIndex(0).tap();
  };

  beforeAll(async () => {
    mnemonic = utils.entropyToMnemonic(utils.randomBytes(32));
    const randomWallet = Wallet.createRandom();
    privateKey = randomWallet.privateKey;
    privateKeyMnemonic = randomWallet.mnemonic.phrase;
    await device.launchApp({
      permissions: {notifications: 'NO'},
    });
  });

  it('should restore privateKey wallet and import mnemonic wallet', async () => {
    await restorePrivateKey(privateKey, PIN);
    await ensureWalletIsVisible(privateKeyMnemonic);

    await element(by.id('wallets')).scrollTo('right');
    await waitFor(element(by.id('wallets_create_import')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('wallets_create_import')).tap();

    await restoreWallet(mnemonic, PIN, 2);
    await ensureWalletIsVisible(mnemonic);
  });

  it('should restore mnemonic wallet and import privateKey wallet', async () => {
    await resetApp();
    await restoreWallet(mnemonic, PIN);
    await ensureWalletIsVisible(mnemonic);

    await element(by.id('wallets')).scrollTo('right');
    await waitFor(element(by.id('wallets_create_import')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('wallets_create_import')).tap();

    await restorePrivateKey(privateKey, PIN, 2);
    await ensureWalletIsVisible(privateKeyMnemonic);
  });

  it('should restore random wallet and more random wallets', async () => {
    await resetApp();
    const generateRandomWallet = (): {
      wallet: string;
      mnemonic: string;
      isPrivateKey: boolean;
    } => {
      const randomWallet = Wallet.createRandom();
      const isPrivateKey = Math.random() < 0.5;

      return {
        wallet: isPrivateKey
          ? randomWallet.privateKey
          : randomWallet.mnemonic.phrase,
        mnemonic: randomWallet.mnemonic.phrase,
        isPrivateKey,
      };
    };
    const getRandomNumber = (bottom: number, top: number) => {
      return Math.floor(Math.random() * (1 + top - bottom)) + bottom;
    };

    const rootWallet = generateRandomWallet();
    const rootRestore = rootWallet.isPrivateKey
      ? restorePrivateKey
      : restoreWallet;
    await rootRestore(rootWallet.wallet, PIN);
    await ensureWalletIsVisible(rootWallet.mnemonic);

    const attempts = getRandomNumber(2, 5);

    for (var attempt = 1; attempt < attempts + 1; attempt++) {
      await element(by.id('wallets')).scrollTo('right');
      await waitFor(element(by.id('wallets_create_import')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('wallets_create_import')).tap();

      const randomWallet = generateRandomWallet();
      const restore = randomWallet.isPrivateKey
        ? restorePrivateKey
        : restoreWallet;
      await restore(randomWallet.wallet, PIN, attempt + 1);
      await ensureWalletIsVisible(randomWallet.mnemonic);
    }
  });
});
