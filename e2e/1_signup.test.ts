import {by, device, element, waitFor} from 'detox';

import {createWallet} from './helpers/createWallet';
import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {PIN} from './test-variables';

describe('Signup', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: {notifications: 'NO'},
    });
  });

  it('should create and backup phrase', async () => {
    await createWallet(PIN);

    await element(by.id('wallet_without_protection_button')).tap();

    await device.disableSynchronization();
    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }
    await device.enableSynchronization();

    await element(by.id('protect_phrase_button')).tap();

    await waitFor(element(by.id('backup_warning_next')))
      .toBeVisible()
      .whileElement(by.id('backup_warning'))
      .scroll(50, 'down');
    await element(by.id('backup_warning_next')).tap();

    const mnemonic_words = [];

    for (let i = 1; i <= 12; i++) {
      // @ts-ignore
      const {text} = await element(
        by.id(`backup_create_mnemonic_word_${i}`),
      ).getAttributes();

      mnemonic_words.push(text);
    }

    await waitFor(element(by.id('backup_create_checkbox')))
      .toBeVisible()
      .whileElement(by.id('backup_create'))
      .scroll(50, 'down');
    await element(by.id('backup_create_checkbox')).tap();
    await element(by.id('backup_create_next')).tap();

    await waitFor(element(by.id('backup_verify')))
      .toBeVisible()
      .withTimeout(3000);

    for (const word of mnemonic_words) {
      const elEnabled = element(
        by.id(`backup_verify_word_${word}_enabled`),
      ).atIndex(0);
      const elDisabled = element(
        by.id(`backup_verify_word_${word}_disabled`),
      ).atIndex(0);
      await waitFor(elEnabled).toBeVisible().withTimeout(1000);
      await elEnabled.tap();
      await waitFor(elDisabled).toBeVisible().withTimeout(1000);
    }

    await waitFor(element(by.id('backup_verify_check')))
      .toBeVisible()
      .whileElement(by.id('backup_verify'))
      .scroll(50, 'down');
    await element(by.id('backup_verify_check')).tap();

    await waitFor(element(by.id('backup_finish')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('backup_finish_finish')).tap();

    await ensureWalletIsVisible(mnemonic_words.join(' '));
  });
});
