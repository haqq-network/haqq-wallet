import {by, device, element, expect, waitFor} from 'detox';
import {Wallet} from 'ethers';

import {createWallet} from './helpers/createWallet';
import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {launchApp} from './helpers/launchApp';
import {restoreWallet} from './helpers/restoreWallet';
import {PIN} from './test-variables';

describe('Routine', () => {
  let mnemonic_words: string[] = [];
  const isAndroid = device.getPlatform() === 'android';

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
      .withTimeout(1000);

    for (const word of mnemonic_words) {
      const el = element(by.id(`backup_verify_word_${word}_enabled`)).atIndex(
        0,
      );
      await waitFor(el).toBeVisible().withTimeout(1000);
      await el.tap();
    }

    await waitFor(element(by.id('backup_verify_check')))
      .toBeVisible()
      .whileElement(by.id('backup_verify'))
      .scroll(50, 'down');
    await element(by.id('backup_verify_check')).tap();

    await waitFor(element(by.id('backup_finish')))
      .toBeVisible()
      .withTimeout(1000);
    await element(by.id('backup_finish_finish')).tap();
    await element(by.id('go_back')).tap();
    await element(by.id('go_back')).tap();
    await element(by.text('Main')).tap();

    await ensureWalletIsVisible(mnemonic_words.join(' '));

    await element(by.text('Settings')).tap();
    await element(by.id('settings_manage_accounts')).tap();
    await element(by.text('Main account')).tap();

    await expect(element(by.id('recovery_warning'))).not.toBeVisible();
  });

  // https://linear.app/haqq/issue/HQM-247
  it('should see and backup valid phrase in settings', async () => {
    mnemonic_words = [];
    await device.uninstallApp();
    await device.installApp();
    await launchApp();

    await createWallet(PIN);

    await expect(element(by.text('No backup'))).toBeVisible();
    await element(by.id('wallets')).scrollTo('right');
    await waitFor(element(by.id('wallets_create_create')))
      .toBeVisible()
      .withTimeout(1000);
    await element(by.id('wallets_create_create')).tap();

    await expect(element(by.id('signup_agreement'))).toBeVisible();
    await element(by.id('signup_agreement_agree')).tap();

    await element(by.id('onboarding_finish_finish')).tap();

    // We have 2 No backup labels
    await expect(
      element(by.text('No backup')).atIndex(isAndroid ? 1 : 0),
    ).toBeVisible();

    const {
      mnemonic: {phrase: secondMnemonic},
    } = Wallet.createRandom();

    await element(by.id('wallets')).scrollTo('right');
    await waitFor(element(by.id('wallets_create_import')))
      .toBeVisible()
      .withTimeout(1000);
    await element(by.id('wallets_create_import')).tap();

    await restoreWallet(secondMnemonic, PIN, 2);
    await expect(element(by.text('Imported'))).toBeVisible();

    await element(by.text('Settings')).tap();
    await element(by.id('settings_manage_accounts')).tap();
    await element(by.text('Main account')).tap();

    /* #region Obtain first mnemonic */
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
      .withTimeout(1000);

    for (const word of mnemonic_words) {
      const el = element(by.id(`backup_verify_word_${word}_enabled`)).atIndex(
        0,
      );
      await waitFor(el).toBeVisible().withTimeout(1000);
      await el.tap();
    }

    await waitFor(element(by.id('backup_verify_check')))
      .toBeVisible()
      .whileElement(by.id('backup_verify'))
      .scroll(50, 'down');
    await element(by.id('backup_verify_check')).tap();

    await waitFor(element(by.id('backup_finish')))
      .toBeVisible()
      .withTimeout(1000);
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
    /* #endregion */

    /* #region First mnemonic verification */
    await element(by.text('Settings')).tap();
    await element(by.id('settings_manage_accounts')).tap();
    await element(by.text('Account #2')).tap();

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

    for (const word of mnemonic_words) {
      await waitFor(element(by.text(word)))
        .toBeVisible()
        .withTimeout(1000);
    }

    await element(by.id('go_back')).tap();
    await element(by.id('go_back')).tap();
    /* #endregion */

    /* #region Second mnemonic verification */
    await element(by.text('Account #3')).tap();

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

    for (const word of secondMnemonic.split(' ')) {
      await waitFor(element(by.text(word)))
        .toBeVisible()
        .withTimeout(1000);
    }
    /* #endregion */
  });
});
