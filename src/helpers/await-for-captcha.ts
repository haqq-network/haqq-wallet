import {CaptchaDataTypes} from '@app/components/captcha';
import {app} from '@app/contexts';

import {hideModal, showModal} from './modal';

export const awaitForCaptcha = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    showModal('captcha');

    app.once('captcha-data', (data: CaptchaDataTypes) => {
      if (!data) {
        reject('data is null');
      }
      switch (data) {
        case 'cancel':
        case 'error':
        case 'expired':
          hideModal();
          return reject?.(data);
        default:
          return resolve?.(data);
      }
    });
  });
};
