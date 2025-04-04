import {by, element, expect} from 'detox';

import {getElementByText} from './i18n';

import {PIN} from '../test-variables';

export const changePIN = async (newPin: string) => {
  await element(by.id('homeSettings')).tap();
  await element(by.text('Security')).tap();

  await device.disableSynchronization();
  for (const num of PIN.split('')) {
    await element(by.id(`numeric_keyboard_${num}`)).tap();
  }
  await device.enableSynchronization();

  await element(by.text('Change PIN')).tap();

  await device.disableSynchronization();
  for (const num of newPin.split('')) {
    await element(by.id(`numeric_keyboard_${num}`)).tap();
  }
  await device.enableSynchronization();

  await expect(getElementByText('onboardingRepeatPinRepeat')).toBeVisible();

  await device.disableSynchronization();
  for (const num of newPin.split('')) {
    await element(by.id(`numeric_keyboard_${num}`)).tap();
  }
  await device.enableSynchronization();

  await element(by.id('go_back')).tap();
};
