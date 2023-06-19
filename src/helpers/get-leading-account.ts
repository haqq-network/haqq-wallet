import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';

import {Feature, isFeatureEnabled} from './is-feature-enabled';

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

  if (!leadingAccount) {
    const wallets = Wallet.getAll();
    const walletTypes = [
      `"${WalletType.mnemonic}"`,
      `"${WalletType.hot}"`,
      `"${WalletType.ledgerBt}"`,
    ];

    if (isFeatureEnabled(Feature.sss)) {
      walletTypes.push(`"${WalletType.sss}"`);
    }

    const mnemonic = wallets
      .filtered(`type in { ${walletTypes.toString()} } and isHidden = false`)
      .sorted('path');
    if (mnemonic.length) {
      leadingAccount = mnemonic[0].address;
    }
  }

  if (!leadingAccount) {
    throw new Error('no_wallets');
  }

  VariablesString.set('leadingAccount', leadingAccount);

  return Wallet.getById(leadingAccount);
}
