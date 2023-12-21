import {by, device, element, expect, waitFor} from 'detox';

export const createWallet = async (PIN: string) => {
  const isAndroid = device.getPlatform() === 'android';

  await expect(element(by.id('welcome'))).toBeVisible();
  await expect(element(by.id('welcome_signup'))).toBeVisible();

  await element(by.id('welcome_signup')).tap();
  await expect(element(by.id('signup_agreement'))).toBeVisible();
  await expect(element(by.id('signup_agreement_agree'))).toBeVisible();

  await element(by.id('signup_agreement_agree')).tap();

  await element(by.id('sss_login_later')).tap();
  // Modal window
  await element(by.label('Accept')).atIndex(0).tap();
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
};
