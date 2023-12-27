import {by, device, element, waitFor} from 'detox';
import {Wallet, utils} from 'ethers';

import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {restoreWallet} from './helpers/restoreWallet';
import {sleep} from './helpers/sleep';
import {PIN, PROVIDER, SOURCE_WALLET} from './test-variables';

describe('Routine', () => {
  const isAndroid = device.getPlatform() === 'android';
  let mnemonic = '';
  let milkWallet: Wallet;
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'NO'},
    });

    mnemonic = utils.entropyToMnemonic(utils.randomBytes(32));
    milkWallet = new Wallet(SOURCE_WALLET, PROVIDER);
    await restoreWallet(mnemonic, PIN);
  });

  it('should create and backup phrase', async () => {
    await ensureWalletIsVisible(mnemonic);
  });

  it('should reopen app', async () => {
    await device.terminateApp();
    await device.launchApp();

    await waitFor(element(by.id('pin')))
      .toBeVisible()
      .withTimeout(15000);

    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }

    await ensureWalletIsVisible(mnemonic);
  });

  it('should transfer coins', async () => {
    await waitFor(element(by.id('wallets')))
      .toBeVisible()
      .withTimeout(15000);

    const wallet = Wallet.fromMnemonic(mnemonic);

    const amountInEther = '0.002';
    const tx = {
      to: wallet.address,
      value: utils.parseEther(amountInEther),
    };

    await milkWallet.sendTransaction(tx);

    await sleep(30_000);

    await element(by.id(`wallets_${wallet.address.toLowerCase()}_send`)).tap();

    const input_address = element(by.id('transaction_address_input'));
    await input_address.tap();
    await input_address.replaceText(milkWallet.address);

    await element(by.id('transaction_address_next')).tap();
    if (isAndroid) {
      // Previous step was for keyboard hide
      await element(by.id('transaction_address_next')).tap();
    }

    await element(by.text('Islamic coin')).tap();

    await waitFor(element(by.id('transaction_sum')))
      .toBeVisible()
      .withTimeout(15000);

    const input_form = element(by.id('transaction_sum_form_input'));
    await input_form.tap();
    await input_form.replaceText('0.001');

    await element(by.id(`transaction_sum_next`)).tap();

    await waitFor(element(by.id('transaction_confirmation')))
      .toBeVisible()
      .withTimeout(15000);

    await element(by.id('transaction_confirmation_submit')).tap();

    await waitFor(element(by.id('transaction_finish')))
      .toBeVisible()
      .withTimeout(15000);

    await element(by.id('transaction_finish_finish')).tap();
  });
});
