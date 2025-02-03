import {by, element, expect, waitFor} from 'detox';

import {getText} from './i18n';
import {onboardingSetup} from './onboardingSetup';

export const createWallet = async (PIN: string) => {
  await waitFor(element(by.id('welcome')))
    .toBeVisible()
    .withTimeout(120_000);

  await expect(element(by.id('welcome_signup'))).toBeVisible();

  await element(by.id('welcome_signup')).tap();
  await expect(element(by.id('signup_agreement'))).toBeVisible();
  await expect(element(by.id('signup_agreement_agree'))).toBeVisible();

  await element(by.id('signup_agreement_agree')).tap();

  await element(by.id('sss_login_later')).tap();

  // Modal window
  await element(by.label(getText('accept')))
    .atIndex(0)
    .tap();

  await onboardingSetup(PIN);
};
