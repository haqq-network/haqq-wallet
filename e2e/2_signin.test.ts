import {by, device, element, expect, waitFor} from 'detox';
import {utils} from 'ethers';

import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
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
    await expect(element(by.id('welcome'))).toBeVisible();
    await expect(element(by.id('welcome_signup'))).toBeVisible();

    await element(by.id('welcome_signin')).tap();
    await expect(element(by.id('signin_agreement'))).toBeVisible();
    await expect(element(by.id('signin_agreement_agree'))).toBeVisible();

    await element(by.id('signin_agreement_agree')).tap();

    await expect(element(by.id('signin_restore'))).toBeVisible();

    await element(by.id('signin_restore_input')).tap();
    await element(by.id('signin_restore_input')).typeText(mnemonic);

    await element(by.id('signin_restore_submit')).tap();

    await expect(element(by.id('onboarding_setup_pin_set'))).toBeVisible();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await expect(element(by.text('Please repeat pin code'))).toBeVisible();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await waitFor(element(by.id('onboarding_biometry_title')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.id('onboarding_biometry_title'))).toBeVisible();

    await element(by.id('onboarding_biometry_skip')).tap();
    if (device.getPlatform() === 'ios') {
      await waitFor(element(by.id('onboarding_track_user_activity')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('onboarding_tracking_skip')).tap();
    }
    await waitFor(element(by.id('onboarding_finish_title')))
      .toBeVisible()
      .withTimeout(15000);

    await expect(element(by.id('onboarding_finish_title'))).toBeVisible();

    await element(by.id('onboarding_finish_finish')).tap();

    await ensureWalletIsVisible(mnemonic);
  });
});
