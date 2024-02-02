import {by, device, element, waitFor} from 'detox';
import {utils} from 'ethers';

import {getCoins} from './helpers/getCoins';
import {restoreWallet} from './helpers/restoreWallet';
import {sleep} from './helpers/sleep';
import {PIN} from './test-variables';

describe('Coin delegation and undelegation', () => {
  // const isAndroid = device.getPlatform() === 'android';
  let mnemonic = '';
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'NO'},
    });

    mnemonic = utils.entropyToMnemonic(utils.randomBytes(32));
    await restoreWallet(mnemonic, PIN);
  });

  it('Should transfer coins', async () => {
    await waitFor(element(by.id('wallets')))
      .toBeVisible()
      .withTimeout(15000);

    await getCoins(mnemonic, '0.10');
  });

  it('Should delegate coins', async () => {
    await element(by.text('Staking')).tap();
    await waitFor(element(by.id('staking-availableSum'))).toBeVisible();

    await element(by.id('staking-validators')).tap();
    await waitFor(element(by.text('Validators list'))).toBeVisible();

    await element(by.id('staking-validators-search')).tap();
    await element(by.id('staking-validators-search-input')).replaceText(
      'val02',
    );

    const validator = element(by.id('validator-val02'));
    await validator.tap();

    await element(by.id('staking-delegate')).tap();

    await element(by.id('undefined_input')).replaceText('0.01');
    await element(by.text('Preview')).tap();

    await element(by.id('staking-preview')).tap();
    await waitFor(element(by.text('Delegate Completed'))).toBeVisible();

    await element(by.text('Done')).tap();
    await element(by.id('go_back')).tap();
    await element(by.text('Cancel')).tap();
    await element(by.id('go_back')).tap();
    await sleep(8_000);
  });

  it('Should undelegate coins', async () => {
    await element(by.id('staking-validators')).tap();
    await waitFor(element(by.text('Validators list'))).toBeVisible();
    const validator = element(by.id('validator-val02'));
    await validator.tap();

    await element(by.id('staking-undelegate')).tap();
    await element(by.id('undefined_input')).replaceText('0.01');

    await element(by.text('Preview')).tap();

    await element(by.text('Undelegate')).atIndex(1).tap();
    await waitFor(element(by.text('Undelegate started')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.text('Done')).tap();
  });
});
