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

export interface AwaitForWalletParams {
  wallets: Wallet[] | Results<Wallet>;
  title: I18N;
  type?: WalletSelectType;
  initialAddress?: string;
  autoSelectWallet?: boolean;
}

export class AwaitForWalletError {
  message?: string;
  constructor(message?: string) {
    this.message = message;
  }
}

export async function awaitForWallet({
  title,
  wallets,
  initialAddress,
  type,
  autoSelectWallet = true,
}: AwaitForWalletParams): Promise<string> {
  if (autoSelectWallet && wallets.length === 1) {
    return Promise.resolve(wallets[0].address);
  }

  return new Promise((resolve, reject) => {
    const removeAllListeners = () => {
      app.removeListener('wallet-selected', onAction);
      app.removeListener('wallet-selected-reject', onReject);
    };

    const onAction = (address: string) => {
      removeAllListeners();
      resolve(address);
    };

    const onReject = () => {
      removeAllListeners();
      reject(new AwaitForWalletError('rejected by user'));
    };

    app.addListener('wallet-selected', onAction);
    app.addListener('wallet-selected-reject', onReject);

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
          autoSelectWallet,
        });
    }
  });
}
