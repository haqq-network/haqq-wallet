import {by, device, element, expect, waitFor} from 'detox';
import {Wallet} from 'ethers';

import {createWallet} from './helpers/createWallet';
import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {launchApp} from './helpers/launchApp';
import {restoreWallet} from './helpers/restoreWallet';
import {PIN} from './test-variables';

describe('Routine', () => {
  const mnemonic_words: string[] = [];

  beforeAll(async () => {
    await launchApp();

    await createWallet(PIN);
  });

  it('should backup phrase from settings', async () => {
    await element(by.text('Settings')).tap();
    await element(by.id('settings_manage_accounts')).tap();
    await element(by.text('Main account')).tap();

    await waitFor(element(by.id('recovery_warning')))
      .toBeVisible()
      .whileElement(by.id('account_details'))
      .scroll(100, 'down');
    await element(by.id('recovery_phrase')).tap();

    await waitFor(element(by.id('backup_warning_next')))
      .toBeVisible()
      .whileElement(by.id('backup_warning'))
      .scroll(50, 'down');
    await element(by.id('backup_warning_next')).tap();

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
      const el = element(by.id(`backup_verify_word_${word}_enabled`)).atIndex(
        0,
      );
      await waitFor(el).toBeVisible().withTimeout(3000);
      await el.tap();
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

    await waitFor(element(by.id('view_recovery_phrase')))
      .toBeVisible()
      .whileElement(by.id('account_details'))
      .scroll(100, 'down');

    await element(by.id('view_recovery_phrase')).tap();

    await device.disableSynchronization();
    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }
    await device.enableSynchronization();

    for (let i = 0; i < mnemonic_words.length; i++) {
      await waitFor(
        element(by.id(`settings_view_recovery_phrase_word_${i + 1}`)),
      )
        .toHaveText(mnemonic_words[i])
        .withTimeout(1000);
    }
  });

  it('should import mnemonic with duplicated word and see valid phrase in settings', async () => {
    let mnemonic: string[] = [];

    while (mnemonic.length === 0) {
      const array = Wallet.createRandom().mnemonic.phrase.split(' ');
      const duplicates = array.filter(
        (item, index) => array.indexOf(item) !== index,
      );
      if (duplicates.length > 0) {
        mnemonic = array;
      }
    }

    await device.reloadReactNative();
    await element(by.id('forgot_the_code')).tap();
    await element(by.id('reset_wallet')).tap();
    await element(by.label('Reset')).atIndex(0).tap();

    await restoreWallet(mnemonic.join(' '), PIN, 1);

    await element(by.text('Settings')).tap();
    await element(by.id('settings_manage_accounts')).tap();
    await element(by.text('Main account')).tap();

    await waitFor(element(by.id('view_recovery_phrase')))
      .toBeVisible()
      .whileElement(by.id('account_details'))
      .scroll(100, 'down');

    await element(by.id('view_recovery_phrase')).tap();

    await device.disableSynchronization();
    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }
    await device.enableSynchronization();

    for (let i = 0; i < mnemonic.length; i++) {
      await waitFor(
        element(by.id(`settings_view_recovery_phrase_word_${i + 1}`)),
      )
        .toHaveText(mnemonic[i])
        .withTimeout(1000);
    }
  });
});
