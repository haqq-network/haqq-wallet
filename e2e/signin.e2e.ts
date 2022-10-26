import {by, device, element, expect} from 'detox';

describe('Signin', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await expect(element(by.id('welcome'))).toBeVisible();
    await expect(element(by.id('welcome_signin'))).toBeVisible();

    await element(by.id('welcome_signin')).tap();
  });
});
