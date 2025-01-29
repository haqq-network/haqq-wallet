import {by, device, element, expect, waitFor} from 'detox';

import {getText} from './i18n';

export const createWallet = async (PIN: string, attempt: number = 1) => {
  const isAndroid = device.getPlatform() === 'android';

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
  await expect(element(by.id('onboarding_setup_pin_set'))).toBeVisible();

  await device.disableSynchronization();
  for (const num of PIN.split('')) {
    await element(by.id(`numeric_keyboard_${num}`)).tap();
  }
  await device.enableSynchronization();

  await expect(
    element(by.text(getText('onboardingRepeatPinRepeat'))),
  ).toBeVisible();

  await device.disableSynchronization();
  for (const num of PIN.split('')) {
    await element(by.id(`numeric_keyboard_${num}`)).tap();
  }
  await device.enableSynchronization();

  if (!isAndroid) {
    await waitFor(element(by.id('onboarding_biometry_title')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.id('onboarding_biometry_title'))).toBeVisible();

    await element(by.id('onboarding_biometry_skip')).tap();

    if (attempt === 1) {
      await waitFor(element(by.id('onboarding_finish_title')))
        .toBeVisible()
        .withTimeout(15000);

      await expect(element(by.id('onboarding_finish_title'))).toBeVisible();
    }
  }

  if (attempt === 1) {
    await element(by.id('onboarding_finish_finish')).tap();
    await waitFor(element(by.id('home-feed-container')))
      .toBeVisible()
      .withTimeout(10_000);
  }
};
