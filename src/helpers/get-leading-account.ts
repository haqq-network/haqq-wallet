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

    const w = wallets
      .filtered(`type = ${walletType} } and isHidden = false`)
      .sorted('path');
    if (w.length) {
      leadingAccount = w[0].address;
    }
    index += 1;
  }

  if (!leadingAccount) {
    throw new Error('no_wallets');
  }

  VariablesString.set('leadingAccount', leadingAccount);

  return Wallet.getById(leadingAccount);
}
