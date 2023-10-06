import {getSdkError} from '@walletconnect/utils';
import {Keyboard} from 'react-native';

import {app} from '@app/contexts';
import {I18N, getText} from '@app/i18n';
import {Modals} from '@app/types';
import {makeID} from '@app/utils';

import {hideModal, showModal} from './modal';
import {LinkParseResult, LinkType, parseDeepLink} from './parse-deep-link';

export type AwaitForScanQrParams = Omit<Modals['qr'], 'taskId'>;

export class AwaitForScanQrError {
  name = 'AwaitForScanQrError';
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
    return new AwaitForScanQrError(error || getSdkError('USER_REJECTED'));
  }

  static getCameraPermissionError() {
    return new AwaitForScanQrError({
      ...getSdkError('UNAUTHORIZED_EVENT'),
      message: getText(I18N.modalQRNoAccessDescription),
    });
  }
}

export enum AwaitForScanQrEvents {
  succes = 'await-for-scan-qr-success',
  error = 'await-for-scan-qr-error',
}

export const SCAN_QR_TASK_ID_LENGTH = 10;

export async function awaitForScanQr(
  params: AwaitForScanQrParams = {},
): Promise<LinkParseResult> {
  return new Promise((resolve, reject) => {
    Keyboard.dismiss();
    const eventTaskId = makeID(SCAN_QR_TASK_ID_LENGTH);
    const succesEventName = `${AwaitForScanQrEvents.succes}:${eventTaskId}`;
    const errorEventName = `${AwaitForScanQrEvents.error}:${eventTaskId}`;

    const removeAllListeners = () => {
      app.removeListener(succesEventName, onAction);
      app.removeListener(errorEventName, onReject);
    };

    const onAction = async (data: string) => {
      removeAllListeners();
      hideModal('qr');
      try {
        const result = await parseDeepLink(data);
        resolve(result);
      } catch (err) {
        Logger.captureException(err, 'awaitForScanQr:parse', {data});
        resolve({
          type: LinkType.Unrecognized,
          rawData: data,
          params: {},
        });
      }
    };

    const onReject = (error: Error | string) => {
      removeAllListeners();
      if (typeof error === 'string') {
        reject(AwaitForScanQrError.getError(error));
      } else {
        reject(error);
      }
    };

    app.addListener(succesEventName, onAction);
    app.addListener(errorEventName, onReject);

    return showModal('qr', {
      ...params,
      eventTaskId,
    });
  });
}
