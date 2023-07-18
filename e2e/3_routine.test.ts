import {by, device, element, expect, waitFor} from 'detox';
import {Wallet, utils} from 'ethers';

import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {PIN, PROVIDER, SOURCE_WALLET} from './test-variables';

describe('Routine', () => {
  let mnemonic = '';
  let milkWallet: Wallet;
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'NO'},
    });

    mnemonic = utils.entropyToMnemonic(utils.randomBytes(32));
    milkWallet = new Wallet(SOURCE_WALLET, PROVIDER);
    await expect(element(by.id('welcome'))).toBeVisible();

    await element(by.id('welcome_signin')).tap();
    await expect(element(by.id('signin_agreement'))).toBeVisible();

    await element(by.id('signin_agreement_agree')).tap();

    await expect(element(by.id('signin_restore'))).toBeVisible();

    await element(by.id('signin_restore_input')).tap();
    await element(by.id('signin_restore_input')).typeText(mnemonic);

    await element(by.id('signin_restore_submit')).tap();

    await expect(element(by.id('onboarding_setup_pin_set'))).toBeVisible();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await expect(element(by.text('Please repeat pin code'))).toBeVisible();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await waitFor(element(by.id('onboarding_biometry_title'))).toBeVisible();

    await element(by.id('onboarding_biometry_skip')).tap();
    if (device.getPlatform() === 'ios') {
      await waitFor(
        element(by.id('onboarding_track_user_activity')),
      ).toBeVisible();

      await element(by.id('onboarding_tracking_skip')).tap();
    }
    await waitFor(element(by.id('onboarding_finish_title'))).toBeVisible();

    await expect(element(by.id('onboarding_finish_title'))).toBeVisible();

    await element(by.id('onboarding_finish_finish')).tap();
  });

  it('should create and backup phrase', async () => {
    await ensureWalletIsVisible(mnemonic);
  });

  it('should reopen app', async () => {
    await device.terminateApp();
    await device.launchApp();

    await waitFor(element(by.id('pin'))).toBeVisible();

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await ensureWalletIsVisible(mnemonic);
  });

  it('should transfer coins', async () => {
    await waitFor(element(by.id('wallets'))).toBeVisible();

    const wallet = Wallet.fromMnemonic(mnemonic);

    const amountInEther = '0.011';
    const tx = {
      to: wallet.address,
      value: utils.parseEther(amountInEther),
    };

    await milkWallet.sendTransaction(tx);

    await element(by.id(`wallets_${wallet.address.toLowerCase()}_send`)).tap();

    await waitFor(element(by.id('transaction_address'))).toBeVisible();

    const input_address = element(by.id('transaction_address_input'));
    await input_address.tap();
    await input_address.typeText(milkWallet.address);

    await element(by.id('transaction_address_next')).tap();

    await waitFor(element(by.id('transaction_sum'))).toBeVisible();

    const input_form = element(by.id('transaction_sum_form_input'));
    await input_form.tap();
    await input_form.typeText('0.01');

    await element(by.id(`transaction_sum_next`)).tap();

    await waitFor(element(by.id('transaction_confirmation'))).toBeVisible();

    await element(by.id('transaction_confirmation_submit')).tap();

    await waitFor(element(by.id('transaction_finish'))).toBeVisible();

    await element(by.id('transaction_finish_finish')).tap();
  });
});
