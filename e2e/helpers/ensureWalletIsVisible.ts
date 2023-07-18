import {by, element, expect, waitFor} from 'detox';
import {Wallet} from 'ethers';

import {shortAddress} from '../../src/helpers/short-address';

export async function ensureWalletIsVisible(mnemonic: string) {
  await waitFor(element(by.id('wallets'))).toBeVisible();

  const wallet = Wallet.fromMnemonic(mnemonic);

  const shorted = shortAddress(wallet.address.toLowerCase(), '•');

  await waitFor(
    element(by.id(`wallets_${wallet.address.toLowerCase()}_card`)),
  ).toBeVisible();

  await expect(
    element(by.id(`wallets_${wallet.address.toLowerCase()}_address`)),
  ).toHaveText(shorted);
}
