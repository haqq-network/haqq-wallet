import {by, element, expect, log, waitFor} from 'detox';
import {Wallet} from 'ethers';

import {getCoins} from './helpers/getCoins';
import {isVisible} from './helpers/isVisibile';
import {launchApp} from './helpers/launchApp';
import {MilkAddressProxy} from './helpers/milkAddressProxy';
import {restoreWallet} from './helpers/restoreWallet';
import {sleep} from './helpers/sleep';
import {PIN} from './test-variables';

describe('Coin delegation and undelegation', () => {
  const wallet = Wallet.createRandom();
  beforeAll(async () => {
    await launchApp();

    await restoreWallet(wallet.mnemonic.phrase, PIN);

    await waitFor(element(by.id('wallets')))
      .toBeVisible()
      .withTimeout(15000);
    await getCoins(wallet.mnemonic.phrase, '0.10');
  });

  it('should delegate coins', async () => {
    await waitFor(element(by.id('current-total')))
      .toHaveText('0.1 ISLM')
      .withTimeout(6 * 60_000);

    const stakingBanner = element(by.id('staking-widget'));
    await waitFor(stakingBanner)
      .toBeVisible()
      .whileElement(by.id('home-feed-container'))
      .scroll(250, 'down');
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

  it('should undelegate coins', async () => {
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

  it('should send the remaining money back to milkaddress by using max button', async () => {
    await device.reloadReactNative();
    await waitFor(element(by.id('numeric_keyboard_1')))
      .toBeVisible()
      .withTimeout(5000);
    await device.disableSynchronization();
    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }
    await device.enableSynchronization();

    await element(by.id(`wallets_${wallet.address.toLowerCase()}_send`)).tap();

    const input_address = element(by.id('transaction_address_input'));
    await input_address.typeText(MilkAddressProxy.address);
    await element(by.id('transaction_address_next')).tap();
    const nextStillVisible = await isVisible('transaction_address_next');
    if (nextStillVisible) {
      try {
        await element(by.id('transaction_address_next')).tap();
      } catch (err) {
        log.warn('Error while tap: ' + JSON.stringify(err));
      }
    }

    await element(by.id('ISLM')).tap();
    await element(by.text('Max')).tap();
    await element(by.id(`transaction_sum_next`)).tap();

    await waitFor(element(by.id('transaction_confirmation')))
      .toBeVisible()
      .withTimeout(15000);

    await waitFor(element(by.id('transaction_confirmation_submit')))
      .toBeVisible()
      .whileElement(by.id('transaction_confirmation'))
      .scroll(50, 'down');
    await element(by.id('transaction_confirmation_submit')).tap();

    await waitFor(element(by.id('transaction_finish')))
      .toBeVisible()
      .withTimeout(15000);

    await waitFor(element(by.id('transaction_finish_finish')))
      .toBeVisible()
      .whileElement(by.id('transaction_finish'))
      .scroll(50, 'down');
    await element(by.id('transaction_finish_finish')).tap();
  });
});
