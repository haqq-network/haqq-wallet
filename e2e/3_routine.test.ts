import {by, device, element, log, waitFor} from 'detox';
import {Wallet, utils} from 'ethers';

import {ensureWalletIsVisible} from './helpers/ensureWalletIsVisible';
import {getCoins} from './helpers/getCoins';
import {isVisible} from './helpers/isVisibile';
import {launchApp} from './helpers/launchApp';
import {MilkAddressProxy} from './helpers/milkAddressProxy';
import {restoreWallet} from './helpers/restoreWallet';
import {PIN} from './test-variables';

describe('Routine', () => {
  let mnemonic = '';
  beforeAll(async () => {
    mnemonic = utils.entropyToMnemonic(utils.randomBytes(32));
    await launchApp();
    await restoreWallet(mnemonic, PIN);
  });

  it('should create and backup phrase', async () => {
    await ensureWalletIsVisible(mnemonic);
  });

  it('should reopen app', async () => {
    await device.reloadReactNative();

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

    await waitFor(element(by.id('current-total')))
      .toHaveText('0.003 ISLM')
      .withTimeout(6 * 60_000);
    await element(by.id(`wallets_${wallet.address.toLowerCase()}_send`)).tap();

    const input_address = element(by.id('transaction_address_input'));
    await input_address.replaceText(MilkAddressProxy.address);
    await input_address.tapReturnKey();
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

    const input_form = element(by.id('transaction_sum_form_input'));
    await input_form.tap();
    await input_form.replaceText('0.001');

    await element(by.id(`transaction_sum_next`)).tap();

    await waitFor(element(by.id('transaction_confirmation')))
      .toBeVisible()
      .withTimeout(15000);

    await waitFor(element(by.id('transaction_confirmation_submit')))
      .toBeVisible()
      .whileElement(by.id('transaction_confirmation'))
      .scroll(50, 'down');
    await element(by.id('transaction_confirmation_submit')).tap();

    await waitFor(element(by.id('transaction_finish')))
      .toBeVisible()
      .withTimeout(15000);

    await waitFor(element(by.id('transaction_finish_finish')))
      .toBeVisible()
      .whileElement(by.id('transaction_finish'))
      .scroll(50, 'down');
    await element(by.id('transaction_finish_finish')).tap();
  });
});
