import {device} from 'detox';
import {utils} from 'ethers';

import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {setupWallet} from './helpers/setupWallet';
import {PIN} from './test-variables';

describe('Signin', () => {
  let mnemonic = '';
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'NO'},
    });

    mnemonic = utils.entropyToMnemonic(utils.randomBytes(32));
  });

  it('should create and backup phrase', async () => {
    await setupWallet(mnemonic, PIN);

    await ensureWalletIsVisible(mnemonic);
  });
});
