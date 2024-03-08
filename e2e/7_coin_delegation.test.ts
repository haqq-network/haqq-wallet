import {by, device, element, expect, waitFor} from 'detox';
import {utils} from 'ethers';

import {getCoins} from './helpers/getCoins';
import {isVisible} from './helpers/isVisibile';
import {restoreWallet} from './helpers/restoreWallet';
import {sleep} from './helpers/sleep';
import {PIN} from './test-variables';

describe('Coin delegation and undelegation', () => {
  let mnemonic = '';
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'NO'},
    });

    mnemonic = utils.entropyToMnemonic(utils.randomBytes(32));
    await restoreWallet(mnemonic, PIN);

    await waitFor(element(by.id('wallets')))
      .toBeVisible()
      .withTimeout(15000);
    await getCoins(mnemonic, '0.10');
  });

  it('Should delegate coins', async () => {
    await waitFor(element(by.id('current-total')))
      .toHaveText('0.1 ISLM')
      .withTimeout(6 * 60_000);

    const stakingBanner = element(by.id('staking-widget'));
    await waitFor(stakingBanner)
      .toBeVisible()
      .whileElement(by.id('home-feed-container'))
      .scroll(100, 'down');
    await stakingBanner.tap();

    await expect(element(by.id('staking-availableSum'))).toBeVisible();

    await element(by.id('staking-validators')).tap();
    await expect(element(by.text('Validators list'))).toBeVisible();

    await element(by.id('staking-validators-search')).tap();
    const input = element(by.id('staking-validators-search-input-input'));
    await waitFor(input).toBeVisible().withTimeout(3000);
    await input.replaceText('val02');
    await input.tapReturnKey();

    const validator = element(by.id('validator-val02'));

    await waitFor(validator)
      .toBeVisible()
      .whileElement(by.id('staking-validators-list'))
      .scroll(100, 'down');
    await validator.tap();

    const isValidatorStillExist = await isVisible('validator-val02');
    if (isValidatorStillExist) {
      await validator.tap();
    }

    await element(by.id('staking-delegate')).tap();

    await waitFor(element(by.id('undefined_input')))
      .toBeVisible()
      .withTimeout(1500);
    await element(by.id('undefined_input')).replaceText('0.01');
    await element(by.text('Preview')).tap();

    await element(by.id('staking-preview-container')).scrollTo('bottom');
    await element(by.id('staking-preview')).tap();
    await expect(element(by.text('Delegate Completed'))).toBeVisible();

    await element(by.id('staking-finish-container')).scrollTo('bottom');
    await element(by.text('Done')).tap();
    await element(by.id('go_back')).tap();
    await element(by.text('Cancel')).tap();
    await element(by.id('go_back')).tap();
    await sleep(8_000);
  });

  it('Should undelegate coins', async () => {
    await element(by.id('staking-validators')).tap();
    await expect(element(by.text('Validators list'))).toBeVisible();
    const validator = element(by.id('validator-val02'));
    await validator.tap();

    await element(by.id('staking-undelegate')).tap();
    await element(by.id('undefined_input')).replaceText('0.01');

    await element(by.text('Preview')).tap();

    await element(by.id('staking-undelegate-container')).scrollTo('bottom');
    await element(by.id('staking-undelegate-button')).tap();
    await waitFor(element(by.text('Undelegate started')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('staking-undelegate-finish')).scrollTo('bottom');
    await element(by.text('Done')).tap();
  });
});
