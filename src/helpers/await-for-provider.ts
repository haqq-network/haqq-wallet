import {Results} from 'realm';

import {app} from '@app/contexts';
import {showModal} from '@app/helpers/modal';
import {I18N} from '@app/i18n';
import {ProviderModel} from '@app/models/provider';

import {getWindowHeight} from './scaling-utils';

export interface AwaitProviderParams {
  title: I18N;
  providers: ProviderModel[] | Results<ProviderModel>;
  initialProviderId: string;
}

export class AwaitProviderError {
  message?: string;

  constructor(message?: string) {
    this.message = message;
  }
}

export async function awaitForProvider({
  title,
  providers,
  initialProviderId,
}: AwaitProviderParams): Promise<string> {
  return new Promise((resolve, reject) => {
    const removeAllListeners = () => {
      app.removeListener('provider-selected', onAction);
      app.removeListener('provider-selected-reject', onReject);
    };

    const onAction = (address: string) => {
      removeAllListeners();
      resolve(address);
    };

    const onReject = () => {
      removeAllListeners();
      reject(new AwaitProviderError('rejected by user'));
    };

    app.addListener('provider-selected', onAction);
    app.addListener('provider-selected-reject', onReject);

    return showModal('providersBottomSheet', {
      title,
      providers,
      closeDistance: () => getWindowHeight() / 6,
      initialProviderId,
    });
  });
}
