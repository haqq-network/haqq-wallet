import {by, element, expect, waitFor} from 'detox';

import {getElementByText} from './i18n';

import {isIOS} from '../test-variables';

export async function onboardingSetup(PIN: string) {
  /// Setup PIN
  await expect(element(by.id('onboarding_setup_pin_set'))).toBeVisible();
  await device.disableSynchronization();
  for (const num of PIN.split('')) {
    await element(by.id(`numeric_keyboard_${num}`)).tap();
  }
  await device.enableSynchronization();

  /// Repeat PIN
  await expect(getElementByText('onboardingRepeatPinRepeat')).toBeVisible();
  await device.disableSynchronization();
  for (const num of PIN.split('')) {
    await element(by.id(`numeric_keyboard_${num}`)).tap();
  }
  await device.enableSynchronization();

  /// Touch ID or Face ID
  await waitFor(element(by.id('onboarding_biometry_title')))
    .toBeVisible()
    .withTimeout(5000);
  await expect(element(by.id('onboarding_biometry_title'))).toBeVisible();
  await element(by.id('onboarding_biometry_skip')).tap();

  /// App Tracking Transparency
  if (isIOS()) {
    await waitFor(element(by.id('onboarding_track_user_activity')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('onboarding_tracking_enable')).tap();
  }

  /// Onboarding Finish
  await waitFor(element(by.id('onboarding_finish_title')))
    .toBeVisible()
    .withTimeout(15000);
  await element(by.id('onboarding_finish_finish')).tap();

  /// Wait for Home screen
  await waitFor(element(by.id('home-feed-container')))
    .toBeVisible()
    .withTimeout(10_000);
}
