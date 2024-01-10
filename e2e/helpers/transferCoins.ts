import {by, device, element, waitFor} from 'detox';

export async function transferCoins(
  source: string,
  address: string,
  amount: string = '0.001',
) {
  const isAndroid = device.getPlatform() === 'android';
  await element(by.id(`wallets_${source.toLowerCase()}_send`)).tap();

  const input_address = element(by.id('transaction_address_input'));
  await input_address.tap();
  await input_address.replaceText(address);

  await element(by.id('transaction_address_next')).tap();
  if (isAndroid) {
    // Previous step was for keyboard hide
    await element(by.id('transaction_address_next')).tap();
  }

  await waitFor(element(by.id('transaction_sum')))
    .toBeVisible()
    .withTimeout(15000);

  const input_form = element(by.id('transaction_sum_form_input'));
  await input_form.tap();
  await input_form.replaceText(amount);

  await element(by.id('transaction_sum_next')).tap();

  await waitFor(element(by.id('transaction_confirmation')))
    .toBeVisible()
    .withTimeout(15000);

  await element(by.id('transaction_confirmation_submit')).tap();

  await waitFor(element(by.id('transaction_finish')))
    .toBeVisible()
    .withTimeout(15000);

  await element(by.id('transaction_finish_finish')).tap();
}
