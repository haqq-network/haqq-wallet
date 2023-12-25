import {app} from '@app/contexts';
import {showModal} from '@app/helpers/modal';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {Eventable} from '@app/types';

import {getWindowHeight} from './scaling-utils';

export enum WalletSelectType {
  bottomSheet = 'bottomSheet',
  screen = 'screen',
}

export interface AwaitForWalletParams {
  wallets: Wallet[];
  title: I18N;
  type?: WalletSelectType;
  initialAddress?: string;
  autoSelectWallet?: boolean;
  suggestedAddress?: string;
  eventSuffix?: string | number;
}

export class AwaitForWalletError {
  message?: string;

  constructor(message?: string) {
    this.message = message;
  }
}

export enum AwaitForWalletEvents {
  success = 'wallet-selected',
  error = 'wallet-selected-reject',
}

export async function awaitForWallet({
  title,
  wallets,
  initialAddress,
  type,
  suggestedAddress,
  autoSelectWallet = true,
  eventSuffix = '',
}: AwaitForWalletParams): Promise<string> {
  if (autoSelectWallet && wallets.length === 1) {
    return Promise.resolve(wallets[0].address);
  }

  if (suggestedAddress) {
    const wallet = Wallet.getById(suggestedAddress.toLowerCase());

    if (wallet) {
      return Promise.resolve(wallet.address);
    }
  }

  const event: Eventable = {
    successEventName: AwaitForWalletEvents.success + eventSuffix,
    errorEventName: AwaitForWalletEvents.error + eventSuffix,
  };

  return new Promise((resolve, reject) => {
    const removeAllListeners = () => {
      app.removeListener(event.successEventName, onAction);
      app.removeListener(event.errorEventName, onReject);
    };

    const onAction = (address: string) => {
      removeAllListeners();
      resolve(address);
    };

    const onReject = () => {
      removeAllListeners();
      reject(new AwaitForWalletError('rejected by user'));
    };

    app.addListener(event.successEventName, onAction);
    app.addListener(event.errorEventName, onReject);

    switch (type) {
      case WalletSelectType.screen: {
        return navigator.navigate('walletSelector', {
          wallets,
          title: getText(title),
          initialAddress,
          ...event,
        });
      }
      case WalletSelectType.bottomSheet:
      default:
        return showModal('walletsBottomSheet', {
          wallets: wallets as Wallet[],
          closeDistance: () => getWindowHeight() / 6,
          title,
          autoSelectWallet,
          initialAddress,
          ...event,
        });
    }
  });
}
