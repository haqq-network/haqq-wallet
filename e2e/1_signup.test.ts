import {by, device, element, expect, waitFor} from 'detox';

import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {PIN} from './test-variables';

describe('Signup', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'NO'},
    });
  });

  it('should create and backup phrase', async () => {
    await expect(element(by.id('welcome'))).toBeVisible();
    await expect(element(by.id('welcome_signup'))).toBeVisible();

    await element(by.id('welcome_signup')).tap();
    await expect(element(by.id('signup_agreement'))).toBeVisible();
    await expect(element(by.id('signup_agreement_agree'))).toBeVisible();

    await element(by.id('signup_agreement_agree')).tap();

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

    await waitFor(element(by.id('backup_notification')))
      .toBeVisible()
      .withTimeout(15000);

    await element(by.id('backup_notification_backup')).tap();

    await waitFor(element(by.id('backup_warning'))).toBeVisible();

    await element(by.id('backup_warning_next')).tap();

    await waitFor(element(by.id('backup_create'))).toBeVisible();

    const mnemonic_words = [];

    for (let i = 1; i <= 12; i++) {
      // @ts-ignore
      const {text} = await element(
        by.id(`backup_create_mnemonic_word_${i}`),
      ).getAttributes();

      mnemonic_words.push(text);
    }

    await element(by.id('backup_create_checkbox')).tap();
    await element(by.id('backup_create_next')).tap();

    await waitFor(element(by.id('backup_verify'))).toBeVisible();

    for (const word of mnemonic_words) {
      const el = element(by.id(`backup_verify_word_${word}`));
      await waitFor(el).toBeVisible();
      await el.tap();
    }

    await element(by.id('backup_verify_check')).tap();

    await waitFor(element(by.id('backup_finish'))).toBeVisible();
    await element(by.id('backup_finish_finish')).tap();

    await ensureWalletIsVisible(mnemonic_words.join(' '));
  });
});
