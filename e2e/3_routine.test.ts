import {by, device, element, log, waitFor} from 'detox';
import {Wallet, utils} from 'ethers';

import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {getCoins} from './helpers/getCoins';
import {isVisible} from './helpers/isVisibile';
import {MilkAddressProxy} from './helpers/milkAddressProxy';
import {restoreWallet} from './helpers/restoreWallet';
import {PIN} from './test-variables';

describe('Routine', () => {
  let mnemonic = '';
  const isAndroid = device.getPlatform() === 'android';
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'NO'},
    });

    mnemonic = utils.entropyToMnemonic(utils.randomBytes(32));
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

    await device.disableSynchronization();
    for (const num of PIN.split('')) {
      await element(by.id(`numeric_keyboard_${num}`)).tap();
    }
    await device.enableSynchronization();

    await ensureWalletIsVisible(mnemonic);
  });

  it('should transfer coins', async () => {
    await waitFor(element(by.id('wallets')))
      .toBeVisible()
      .withTimeout(15000);

    const wallet = Wallet.fromMnemonic(mnemonic);

    const coinsAmount = '0.003';
    await getCoins(mnemonic, coinsAmount);

    await waitFor(element(by.text('ISLM: 0.003')))
      .toBeVisible()
      .withTimeout(6 * 60_000);
    await element(by.id(`wallets_${wallet.address.toLowerCase()}_send`)).tap();

    const input_address = element(by.id('transaction_address_input'));
    await input_address.typeText(MilkAddressProxy.address);
    if (!isAndroid) {
      await input_address.tapReturnKey();
    }
    await element(by.id('transaction_address_next')).tap();
    const nextStillVisible = await isVisible('transaction_address_next');
    if (nextStillVisible) {
      try {
        await element(by.id('transaction_address_next')).tap();
      } catch (err) {
        log.warn('Error while tap: ' + JSON.stringify(err));
      }
    }
    await element(by.text(`${coinsAmount} ISLM`))
      .atIndex(0)
      .tap();
    if (isAndroid) {
      await element(by.text(`${coinsAmount} ISLM`))
        .atIndex(0)
        .tap();
    }

    const input_form = element(by.id('transaction_sum_form_input'));
    await input_form.tap();
    await input_form.replaceText('0.001');

    await element(by.id(`transaction_sum_next`)).tap();

    await waitFor(element(by.id('transaction_confirmation')))
      .toBeVisible()
      .withTimeout(15000);

    await element(by.id('transaction_confirmation')).scrollTo('bottom');
    await element(by.id('transaction_confirmation_submit')).tap();

    await waitFor(element(by.id('transaction_finish')))
      .toBeVisible()
      .withTimeout(15000);

    await element(by.id('transaction_finish')).scrollTo('bottom');
    await element(by.id('transaction_finish_finish')).tap();
  });
});
