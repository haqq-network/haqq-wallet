import {device} from 'detox';
import {utils} from 'ethers';

import {createWallet} from './helpers/createWallet';
import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {launchApp} from './helpers/launchApp';
import {restoreWallet} from './helpers/restoreWallet';
import {PIN} from './test-variables';

describe('Reset Wallet', () => {
  let mnemonic = '';
  beforeEach(async () => {
    await device.uninstallApp();
    await device.installApp();
    await launchApp();

    mnemonic = utils.entropyToMnemonic(utils.randomBytes(32));
  });

  it('should reset existing wallet', async () => {
    await restoreWallet(mnemonic, PIN);
    await ensureWalletIsVisible(mnemonic);
    await device.reloadReactNative();
    await element(by.id('forgot_the_code')).tap();
    await element(by.id('reset_wallet')).tap();
    await element(by.label('Reset')).atIndex(0).tap();
    await restoreWallet(mnemonic, PIN);
    await ensureWalletIsVisible(mnemonic);
  });

  it('should reset new wallet', async () => {
    await createWallet(PIN);
    await device.reloadReactNative();
    await element(by.id('forgot_the_code')).tap();
    await element(by.id('reset_wallet')).tap();
    await element(by.label('Reset')).atIndex(0).tap();
    await createWallet(PIN);
  });
});
