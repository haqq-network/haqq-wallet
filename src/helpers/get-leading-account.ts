import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';

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
    const mnemonic = wallets
      .filtered('type = "mnemonic" and isHidden = false')
      .sorted('path');
    if (mnemonic.length) {
      leadingAccount = mnemonic[0].address;
    }
  }

  if (!leadingAccount) {
    const wallets = Wallet.getAll();
    const hot = wallets
      .filtered('type = "hot" and isHidden = false')
      .sorted('path');
    if (hot.length) {
      leadingAccount = hot[0].address;
    }
  }

  if (!leadingAccount) {
    const wallets = Wallet.getAll();
    const ledger = wallets
      .filtered('type = "ledger" and isHidden = false')
      .sorted('path');
    if (ledger.length) {
      leadingAccount = ledger[0].address;
    }
  }

  if (!leadingAccount) {
    throw new Error('no_wallets');
  }

  VariablesString.set('leadingAccount', leadingAccount);

  return Wallet.getById(leadingAccount);
}
