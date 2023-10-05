import {by, device, element, waitFor} from 'detox';

import {createWallet} from './helpers/createWallet';
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
    await createWallet(PIN);

    await element(by.id('wallet_without_protection_button')).tap();

    await element(by.id('protect_pharse_button')).tap();
    await element(by.id('backup_warning_next')).tap();

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

    await waitFor(element(by.id('backup_verify')))
      .toBeVisible()
      .withTimeout(3000);

    for (const word of mnemonic_words) {
      const el = element(by.id(`backup_verify_word_${word}`)).atIndex(0);
      await waitFor(el).toBeVisible().withTimeout(3000);
      await el.tap();
    }

    await element(by.id('backup_verify_check')).tap();

    await waitFor(element(by.id('backup_finish')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('backup_finish_finish')).tap();

    await ensureWalletIsVisible(mnemonic_words.join(' '));
  });
});
