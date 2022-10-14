import {by, device, element, expect} from 'detox';

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await expect(element(by.id('welcome'))).toBeVisible();
    await expect(element(by.id('welcome_signup'))).toBeVisible();

    await element(by.id('welcome_signup')).tap();
    await expect(element(by.id('signup_agreement'))).toBeVisible();
    await expect(element(by.id('signup_agreement_agree'))).toBeVisible();

    await element(by.id('signup_agreement_agree')).tap();
  });
});
