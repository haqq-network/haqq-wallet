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

      hideModal();
      switch (data) {
        case 'chalcancel':
        case 'chalexpired':
        case 'error':
        case 'expired':
        case 'click-outside':
          return reject?.(data);
        default:
          return resolve?.(data);
      }
    });
  });
};
