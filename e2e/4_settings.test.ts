import {by, device, element, expect, waitFor} from 'detox';

import {createWallet} from './helpers/createWallet';
import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {PIN} from './test-variables';

describe('Routine', () => {
  const mnemonic_words: string[] = [];

  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'NO'},
    });

    await createWallet(PIN);
  });

  it('should backup phrase from settings', async () => {
    await element(by.text('Settings')).tap();
    await element(by.id('settings_manage_accounts')).tap();
    await element(by.text('Main account')).tap();

    await expect(element(by.id('recovery_warning'))).toBeVisible();
    await element(by.id('recovery_phrase')).tap();

    await element(by.id('backup_warning_next')).tap();

    for (let i = 1; i <= 12; i++) {
      // @ts-ignore
      const {text} = await element(
        by.id(`backup_create_mnemonic_word_${i}`),
      ).getAttributes();

      mnemonic_words.push(text);
    }

    await element(by.id('backup_create_checkbox')).tap();
    await element(by.id('backup_create_next')).tap();

    await waitFor(element(by.id('backup_verify')))
      .toBeVisible()
      .withTimeout(3000);

    for (const word of mnemonic_words) {
      const el = element(by.id(`backup_verify_word_${word}_enabled`)).atIndex(
        0,
      );
      await waitFor(el).toBeVisible().withTimeout(3000);
      await el.tap();
    }

    await element(by.id('backup_verify_check')).tap();

    await waitFor(element(by.id('backup_finish')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('backup_finish_finish')).tap();
    await element(by.id('go_back')).tap();
    await element(by.id('go_back')).tap();
    await element(by.text('Main')).tap();

    await ensureWalletIsVisible(mnemonic_words.join(' '));

    await element(by.text('Settings')).tap();
    await element(by.id('settings_manage_accounts')).tap();
    await element(by.text('Main account')).tap();

    await expect(element(by.id('recovery_warning'))).not.toBeVisible();
    await element(by.id('go_back')).tap();
    await element(by.id('go_back')).tap();
    await element(by.text('Main')).tap();
  });

  it('should see valid phrase in settings', async () => {
    await element(by.text('Settings')).tap();
    await element(by.id('settings_manage_accounts')).tap();
    await element(by.text('Main account')).tap();

    await element(by.id('view_recovery_phrase')).tap();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    for (const word of mnemonic_words) {
      await expect(element(by.text(word))).toBeVisible();
    }

    await element(by.id('go_back')).tap();
    await element(by.id('go_back')).tap();
    await element(by.id('go_back')).tap();
    await element(by.text('Main')).tap();
  });
});
