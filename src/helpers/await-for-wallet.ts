import {Results} from 'realm';

import {app} from '@app/contexts';
import {showModal} from '@app/helpers/modal';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {WINDOW_HEIGHT} from '@app/variables/common';

export enum WalletSelectType {
  bottomSheet = 'bottomSheet',
  screen = 'screen',
}

export async function awaitForWallet(
  wallets: Wallet[] | Results<Wallet>,
  title: I18N,
  type?: WalletSelectType,
  initialAddress?: string,
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

    switch (type) {
      case WalletSelectType.screen: {
        return navigator.navigate('walletSelector', {
          wallets,
          title: getText(title),
          initialAddress,
        });
      }
      case WalletSelectType.bottomSheet:
      default:
        return showModal('wallets-bottom-sheet', {
          wallets,
          closeDistance: WINDOW_HEIGHT / 6,
          title,
        });
    }
  });
}
