import {by, element, expect, log} from 'detox';

import {isVisible} from './isVisibile';
import {onboardingSetup} from './onboardingSetup';

export const restorePrivateKey = async (
  privateKey: string,
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
  await input.replaceText(privateKey);
  await input.tapReturnKey();

  try {
    await element(by.id('signin_restore')).scroll(200, 'down');
  } catch (err) {}
  try {
    await element(by.id('signin_restore_submit')).tap({x: 0, y: 0});
  } catch (err) {
    log.warn('Error while tap: ' + JSON.stringify(err));
  }

  if (isFirstTry) {
    await onboardingSetup(PIN);
  }

  if (await isVisible('onboarding_finish_finish')) {
    await element(by.id('onboarding_finish_finish')).tap();
  }
};
