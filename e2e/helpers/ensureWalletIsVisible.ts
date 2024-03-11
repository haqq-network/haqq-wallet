import {by, element, expect, waitFor} from 'detox';
import {Wallet} from 'ethers';

import {shortAddress} from '../../src/helpers/short-address';

export async function ensureWalletIsVisible(mnemonic: string) {
  await waitFor(element(by.id('wallets')))
    .toBeVisible()
    .withTimeout(15000);

  const wallet = Wallet.fromMnemonic(mnemonic);

  const shorted = shortAddress(wallet.address.toLowerCase(), '•');

  const walletID = `wallets_${wallet.address.toLowerCase()}_card`;

  await waitFor(element(by.id(walletID)))
    .toBeVisible()
    .whileElement(by.id('wallets'))
    .scroll(350, 'right');

  await expect(
    element(by.id(`wallets_${wallet.address.toLowerCase()}_address`)),
  ).toHaveText(shorted);
}
