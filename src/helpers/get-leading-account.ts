import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';

const walletTypes = [
  WalletType.sss,
  WalletType.mnemonic,
  WalletType.hot,
  WalletType.ledgerBt,
];

export function getLeadingAccount() {
  let leadingAccount = VariablesString.get('leadingAccount');

  if (leadingAccount) {
    const wallet = Wallet.getById(leadingAccount);

    if (!wallet || wallet?.isHidden === true) {
      leadingAccount = undefined;
    } else {
      return wallet;
    }
  }

  let index = 0;
  const wallets = Wallet.getAllVisible();

  while (!leadingAccount && index < walletTypes.length) {
    const walletType = walletTypes[index];

    const wallet = wallets
      .filter(w => w.type === walletType && !w.isHidden)
      // if path undefined for some reason then function equals strings
      .sort((a, b) => a.path?.localeCompare(b.path || '') || 0);
    if (wallet.length) {
      leadingAccount = wallet[0].address;
    }
    index += 1;
  }

  if (!leadingAccount) {
    return null;
  }

  VariablesString.set('leadingAccount', leadingAccount);

  return Wallet.getById(leadingAccount);
}
