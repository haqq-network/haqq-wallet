import {by, element, waitFor} from 'detox';

import {PIN} from '../test-variables';

export const changePIN = async (newPin: string) => {
  await element(by.id('homeSettings')).tap();
  await element(by.text('Security')).tap();

  for (const num of PIN.split('')) {
    await element(by.id(`numeric_keyboard_${num}`)).tap();
  }

  await element(by.text('Change PIN')).tap();

  for (const num of newPin.split('')) {
    await element(by.id(`numeric_keyboard_${num}`)).tap();
  }

  await waitFor(element(by.text('Please repeat pin code'))).toBeVisible();

  for (const num of newPin.split('')) {
    await element(by.id(`numeric_keyboard_${num}`)).tap();
  }

  await waitFor(element(by.text('Security'))).toBeVisible();
  await element(by.id('go_back')).tap();
};
