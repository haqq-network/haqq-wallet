import {by, element, expect, waitFor} from 'detox';

export const restoreWallet = async (
  mnemonic: string,
  PIN: string,
  attempt: number = 1,
) => {
  const isAndroid = device.getPlatform() === 'android';

  await expect(element(by.id('welcome'))).toBeVisible();
  await expect(element(by.id('welcome_signup'))).toBeVisible();

  await element(by.id('welcome_signin')).tap();
  await element(by.id('signin_network_skip')).tap();
  await expect(element(by.id('signin_agreement'))).toBeVisible();
  await expect(element(by.id('signin_agreement_agree'))).toBeVisible();

  await element(by.id('signin_agreement_agree')).tap();

  await expect(element(by.id('signin_restore'))).toBeVisible();

  await element(by.id('signin_restore_input')).tap();
  await element(by.id('signin_restore_input')).replaceText(mnemonic);

  await element(by.id('signin_restore_submit')).tap();

  // Choose account flow
  await element(by.id('wallet_add_1')).tap();
  await element(by.text('Ledger')).tap();
  await expect(element(by.id('wallet_remove_1'))).toBeVisible();
  await element(by.text('Basic')).tap();
  await element(by.id('wallet_remove_1')).tap();
  await expect(element(by.id('choose_account_next'))).not.toBeVisible();
  await element(by.id('wallet_add_1')).tap();
  await element(by.id('choose_account_next')).tap();

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

  // Skip BackupSssSuggestion modal
  if (attempt < 2) {
    await waitFor(element(by.id('backup_sss_suggestion')))
      .toBeVisible()
      .withTimeout(15000);

    await element(by.id('backup_sss_suggestion_skip_button')).tap();
    await element(by.label('Accept')).atIndex(0).tap();
  }
};
