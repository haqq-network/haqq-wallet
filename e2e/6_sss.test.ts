import {expect as jestExpect} from '@jest/globals';
import {by, device, element, expect, waitFor} from 'detox';

import {getTimeStamp} from './helpers/getTimeStamp';
import {PIN} from './test-variables';

describe.skip('SSS Wallet', () => {
  let uid = '';
  let mnemonic = '';
  const isAndroid = device.getPlatform() === 'android';

  beforeAll(() => {
    uid = `test${getTimeStamp()}@haqq`;
  });

  beforeEach(async () => {
    await device.uninstallApp();
    await device.installApp();
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'NO'},
    });
  });

  it('should create SSS wallet', async () => {
    await expect(element(by.id('welcome'))).toBeVisible();
    await expect(element(by.id('welcome_signup'))).toBeVisible();
    await element(by.id('welcome_signup')).tap();

    await expect(element(by.id('signup_agreement'))).toBeVisible();
    await expect(element(by.id('signup_agreement_agree'))).toBeVisible();

    await element(by.id('signup_agreement_agree')).tap();

    await expect(element(by.id('sss_login_custom'))).toBeVisible();

    await element(by.id('sss_login_custom')).tap();

    await expect(element(by.text('Enter email'))).toBeVisible();
    await expect(element(by.id('custom_provider_email_input'))).toBeVisible();
    await element(by.id('custom_provider_email_input')).replaceText(uid);
    await element(by.id('custom_provider_email_submit')).tap();

    await expect(element(by.id('onboarding_setup_pin_set'))).toBeVisible();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await expect(element(by.text('Please repeat pin code'))).toBeVisible();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    if (!isAndroid) {
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
    }

    await element(by.id('onboarding_finish_finish')).tap();

    await waitFor(element(by.text('Your wallets'))).toBeVisible();

    await element(by.text('Settings')).tap();
    await element(by.text('Manage accounts')).tap();
    await element(by.text('Main account')).tap();

    await element(by.text('View Recovery phrase')).tap();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await waitFor(element(by.text('Your recovery phrase'))).toBeVisible();

    const mnemonic_words = [];

    for (let i = 1; i <= 24; i++) {
      try {
        // @ts-ignore
        const {text} = await element(
          by.id(`settings_view_recovery_phrase_word_${i}`),
        ).getAttributes();

        if (text) {
          mnemonic_words.push(text);
        }
      } catch (e) {}
    }

    mnemonic = mnemonic_words.join(' ');

    // await getCoins(mnemonic);
    //
    // await device.terminateApp();
    // await device.launchApp();
    //
    // await waitFor(element(by.id('pin')))
    //   .toBeVisible()
    //   .withTimeout(15000);
    //
    // for (const num of PIN.split('')) {
    //   await element(by.id(`numeric_keyboard_${num}`)).tap();
    // }
    //
    // await ensureWalletIsVisible(mnemonic);
    //
    // const wallet = Wallet.fromMnemonic(mnemonic);
    //
    // await transferCoins(wallet.address, milkWallet.address);
  });

  it('should restore SSS wallet', async () => {
    await expect(element(by.id('welcome'))).toBeVisible();
    await expect(element(by.id('welcome_signin'))).toBeVisible();
    await element(by.id('welcome_signin')).tap();

    await expect(element(by.id('sss_login_custom'))).toBeVisible();

    await element(by.id('sss_login_custom')).tap();

    await expect(element(by.text('Enter email'))).toBeVisible();
    await expect(element(by.id('custom_provider_email_input'))).toBeVisible();
    await element(by.id('custom_provider_email_input')).replaceText(uid);
    await element(by.id('custom_provider_email_submit')).tap();

    await expect(element(by.id('onboarding_setup_pin_set'))).toBeVisible();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await expect(element(by.text('Please repeat pin code'))).toBeVisible();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    if (!isAndroid) {
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
    }

    await waitFor(element(by.text('Choose account'))).toBeVisible();
    await waitFor(element(by.text('Add'))).toBeVisible();

    await element(by.id('wallet_add_1')).tap();

    await waitFor(element(by.text('Add 1 account'))).toBeVisible();
    await element(by.text('Add 1 account')).tap();

    await element(by.id('onboarding_finish_finish')).tap();

    await waitFor(element(by.text('Your wallets'))).toBeVisible();

    await element(by.text('Settings')).tap();
    await element(by.text('Manage accounts')).tap();
    await element(by.text('Main account')).tap();

    await element(by.text('View Recovery phrase')).tap();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await waitFor(element(by.text('Your recovery phrase'))).toBeVisible();

    const mnemonic_words = [];

    for (let i = 1; i <= 24; i++) {
      try {
        // @ts-ignore
        const {text} = await element(
          by.id(`settings_view_recovery_phrase_word_${i}`),
        ).getAttributes();

        if (text) {
          mnemonic_words.push(text);
        }
      } catch (e) {}
    }

    const newMnemonic = mnemonic_words.join(' ');

    await jestExpect(newMnemonic).toBe(mnemonic);
  });
});
