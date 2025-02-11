import {by, element, expect, log, waitFor} from 'detox';

import {isVisible} from './isVisibile';
import {onboardingSetup} from './onboardingSetup';

export const restoreWallet = async (
  mnemonic: string,
  PIN: string,
  attempt: number = 1,
) => {
  const isFirstTry = attempt === 1;

  if (isFirstTry) {
    await expect(element(by.id('welcome'))).toBeVisible();
    await expect(element(by.id('welcome_signup'))).toBeVisible();

    await element(by.id('welcome_signin')).tap();
  }

  await element(by.id('signin_network_phrase_or_private_key')).tap();
  await expect(element(by.id('signin_agreement'))).toBeVisible();

  await element(by.id('signin_agreement_agree')).tap();

  const input = element(by.id('signin_restore_input'));
  await input.tap();
  await input.replaceText(mnemonic);
  await input.tapReturnKey();

  try {
    await element(by.id('signin_restore')).scroll(200, 'down');
  } catch (err) {}
  try {
    await element(by.id('signin_restore_submit')).tap({x: 0, y: 0});
  } catch (err) {
    log.warn('Error while tap: ' + JSON.stringify(err));
  }

  // Choose account flow
  await waitFor(element(by.id('wallet_add_1')))
    .toBeVisible()
    .withTimeout(3000);
  await element(by.id('wallet_add_1')).tap();

  const isWalletRemoveVisible = await isVisible('wallet_remove_1');
  if (!isWalletRemoveVisible) {
    //Try one more time
    await element(by.id('wallet_add_1')).tap();
  }

  // TODO: Think how to reduce steps in other tests
  // await element(by.text('Ledger')).tap();
  // await expect(element(by.id('wallet_remove_1'))).toBeVisible();
  // await element(by.text('Basic')).tap();
  // await element(by.id('wallet_remove_1')).tap();
  // await expect(element(by.id('choose_account_next'))).not.toBeVisible();
  // await element(by.id('wallet_add_1')).tap();

  // Generating accounts from hdPath might be slow on low-end devices
  await element(by.id('choose_account_next')).tap();

  if (isFirstTry) {
    await onboardingSetup(PIN);
  }

  if (await isVisible('onboarding_finish_finish')) {
    await element(by.id('onboarding_finish_finish')).tap();
  }
};
