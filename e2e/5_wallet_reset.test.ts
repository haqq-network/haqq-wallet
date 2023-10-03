import {device} from 'detox';
import {utils} from 'ethers';

import {createWallet} from './helpers/createWallet';
import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {restoreWallet} from './helpers/restoreWallet';
import {PIN} from './test-variables';

describe('Reset Wallet', () => {
  let mnemonic = '';
  beforeEach(async () => {
    await device.uninstallApp();
    await device.installApp();
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'NO'},
    });

    mnemonic = utils.entropyToMnemonic(utils.randomBytes(32));
  });

  it('should reset existing wallet', async () => {
    await restoreWallet(mnemonic, PIN);
    await ensureWalletIsVisible(mnemonic);
    await device.reloadReactNative();
    await element(by.id('forgot_the_code')).tap();
    await element(by.id('reset_wallet')).tap();
    await element(
      by.label('Reset').and(by.type('_UIAlertControllerActionView')),
    ).tap();
    await restoreWallet(mnemonic, PIN, 2);
    await ensureWalletIsVisible(mnemonic);
  });

  it('should reset new wallet', async () => {
    await createWallet(PIN);
    await device.reloadReactNative();
    await element(by.id('forgot_the_code')).tap();
    await element(by.id('reset_wallet')).tap();
    await element(
      by.label('Reset').and(by.type('_UIAlertControllerActionView')),
    ).tap();
    await createWallet(PIN, 2);
  });
});
