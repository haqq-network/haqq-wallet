import {by, device, element, expect, waitFor} from 'detox';
import {PIN} from './test-variables';

describe('Signup', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await expect(element(by.id('welcome'))).toBeVisible();
    await expect(element(by.id('welcome_signup'))).toBeVisible();

    await element(by.id('welcome_signup')).tap();
    await expect(element(by.id('signup_agreement'))).toBeVisible();
    await expect(element(by.id('signup_agreement_agree'))).toBeVisible();

    await element(by.id('signup_agreement_agree')).tap();

    await expect(element(by.text('Set 6-digital pin code'))).toBeVisible();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await expect(element(by.text('Please repeat pin code'))).toBeVisible();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await waitFor(element(by.id('onboarding_biometry_title')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.id('onboarding_biometry_title'))).toBeVisible();

    await element(by.id('onboarding_biometry_skip')).tap();

    await waitFor(element(by.id('onboarding_finish_title')))
      .toBeVisible()
      .withTimeout(15000);

    await expect(element(by.id('onboarding_finish_title'))).toBeVisible();

    await element(by.id('onboarding_finish_finish')).tap();
  });
});
