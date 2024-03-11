import {by, device, element, expect} from 'detox';

import {changePIN} from './helpers/changePIN';
import {createWallet} from './helpers/createWallet';
import {launchApp} from './helpers/launchApp';
import {PIN} from './test-variables';

describe('Changing PIN and auth with new PIN', () => {
  const newPin = '987654';
  beforeAll(async () => {
    await launchApp();

    await createWallet(PIN);
    await changePIN(newPin);
  });

  it('Authorize with new PIN', async () => {
    await device.reloadReactNative();
    await expect(element(by.id('numeric_keyboard_1'))).toBeVisible();

    for (const num of newPin.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await expect(element(by.text('Your wallets'))).toBeVisible();
  });
});
