import {getSdkError} from '@walletconnect/utils';

import {app} from '@app/contexts';
import {showModal} from '@app/helpers/modal';
import {ModalType, Modals} from '@app/types';

type Params = Omit<
  Modals[ModalType.keystoneQR],
  'succesEventName' | 'errorEventName'
>;

export class AwaitForQRSignError {
  name = 'AwaitForQRSignError';
  message?: string;
  code?: number;
  stack?: string;

  constructor(params: {code: number; message: string} | string | Error) {
    if (typeof params === 'string') {
      this.message = params;
    } else {
      Object.assign(this, params);
    }
  }

  static getError(error?: string | Error) {
    return new AwaitForQRSignError(error || getSdkError('USER_REJECTED'));
  }
}

export enum AwaitForQrSignEvents {
  succes = 'await-for-sign-qr-success',
  error = 'await-for-sign-qr-error',
}

export async function awaitForQRSign(params: Params): Promise<string> {
  return new Promise((resolve, reject) => {
    const succesEventName = `${AwaitForQrSignEvents.succes}:${params.requestID}`;
    const errorEventName = `${AwaitForQrSignEvents.error}:${params.requestID}`;

    const removeAllListeners = () => {
      app.removeListener(succesEventName, onAction);
      app.removeListener(errorEventName, onReject);
    };

    const onAction = (address: string) => {
      removeAllListeners();
      resolve(address);
    };

    const onReject = () => {
      removeAllListeners();
      reject(new AwaitForQRSignError('rejected by user'));
    };

    app.addListener(succesEventName, onAction);
    app.addListener(errorEventName, onReject);

    return showModal(ModalType.keystoneQR, {
      ...params,
      succesEventName,
      errorEventName,
    });
  });
}
