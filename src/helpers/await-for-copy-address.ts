import {app} from '@app/contexts';
import {showModal} from '@app/helpers/modal';
import {I18N} from '@app/i18n';
import {ProviderModel} from '@app/models/provider';
import {ModalType} from '@app/types';

import {getWindowHeight} from './scaling-utils';

export interface AwaitCopyAddressParams {
  title: I18N;
  providers?: ProviderModel[];
  initialProviderChainId: number;
  desableAllNetworksOption?: boolean;
}

export class AwaitCopyAddressError {
  message?: string;

  constructor(message?: string) {
    this.message = message;
  }
}

export async function awaitForCopyAddress({
  title,
  providers,
  initialProviderChainId,
  desableAllNetworksOption,
}: AwaitCopyAddressParams): Promise<string> {
  return new Promise((resolve, reject) => {
    const removeAllListeners = () => {
      app.removeListener('copy-address-selected', onAction);
      app.removeListener('copy-address-reject', onReject);
    };

    const onAction = (address: string) => {
      removeAllListeners();
      resolve(address);
    };

    const onReject = () => {
      removeAllListeners();
      reject(new AwaitCopyAddressError('rejected by user'));
    };

    app.addListener('provider-selected', onAction);
    app.addListener('provider-selected-reject', onReject);

    return showModal(ModalType.copyAddressBottomSheet, {
      title,
      closeDistance: () => getWindowHeight() / 6,
      initialProviderChainId,
      desableAllNetworksOption,
      providers,
    });
  });
}
