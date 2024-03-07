import {by, element, expect, log, waitFor} from 'detox';

import {isVisible} from './isVisibile';

export const restorePrivateKey = async (
  privateKey: string,
  PIN: string,
  attempt: number = 1,
) => {
  const isAndroid = device.getPlatform() === 'android';
  const isFirstTry = attempt === 1;

  if (isFirstTry) {
    await expect(element(by.id('welcome'))).toBeVisible();
    await expect(element(by.id('welcome_signup'))).toBeVisible();

    await element(by.id('welcome_signin')).tap();
  }

  await element(by.id('signin_network_skip')).tap();
  await expect(element(by.id('signin_agreement'))).toBeVisible();

  await element(by.id('signin_agreement_agree')).tap();

  const input = element(by.id('signin_restore_input'));
  await input.tap();
  await input.replaceText(privateKey);
  await input.tapReturnKey();

  try {
    await element(by.id('signin_restore')).scroll(200, 'down');
  } catch (err) {
    log.warn('Error while scrolling: ' + JSON.stringify(err));
  }
  try {
    await element(by.id('signin_restore_submit')).tap({x: 0, y: 0});
  } catch (err) {
    log.warn('Error while tap: ' + JSON.stringify(err));
  }

  if (isFirstTry) {
    await expect(element(by.id('onboarding_setup_pin_set'))).toBeVisible();

    // First tap after restoring PRIVATE KEY ONLY (crazy) is missing
    await element(by.id('onboarding_setup_pin_set')).tap();
    await expect(element(by.id('onboarding_setup_pin_set'))).toBeVisible();

    await device.disableSynchronization();
    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }
    await device.enableSynchronization();

    await expect(element(by.text('Please repeat pin code'))).toBeVisible();

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
      await waitFor(element(by.id('onboarding_track_user_activity')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('onboarding_tracking_skip')).tap();

      if (isFirstTry) {
        await waitFor(element(by.id('onboarding_finish_title')))
          .toBeVisible()
          .withTimeout(15000);

        await expect(element(by.id('onboarding_finish_title'))).toBeVisible();
      }
    }
  }
  await waitFor(element(by.id('onboarding_finish_finish')))
    .toBeVisible()
    .withTimeout(3000);
  await element(by.id('onboarding_finish_finish')).tap();

  // Android: sometimes finish button should be pressed twice
  if (await isVisible('onboarding_finish_finish')) {
    await element(by.id('onboarding_finish_finish')).tap();
  }
};
