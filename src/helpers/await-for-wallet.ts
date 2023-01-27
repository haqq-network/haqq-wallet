import {Results} from 'realm';

import {app} from '@app/contexts';
import {showModal} from '@app/helpers/modal';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WINDOW_HEIGHT} from '@app/variables/common';

export async function awaitForWallet(
  wallets: Wallet[] | Results<Wallet>,
  title: I18N,
): Promise<string> {
  if (wallets.length === 1) {
    return Promise.resolve(wallets[0].address);
  }

  return new Promise(resolve => {
    const onAction = (address: string) => {
      app.removeListener('wallet-selected', onAction);
      resolve(address);
    };

    app.addListener('wallet-selected', onAction);

    showModal('wallets-bottom-sheet', {
      wallets,
      closeDistance: WINDOW_HEIGHT / 6,
      title,
    });
  });
}
