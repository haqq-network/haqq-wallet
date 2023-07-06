import {CaptchaDataTypes, CaptchaType} from '@app/components/captcha';
import {app} from '@app/contexts';

import {hideModal, showModal} from './modal';

export interface AwaitForCaptchaParams {
  type?: CaptchaType;
}

export const awaitForCaptcha = ({
  type = CaptchaType.hcaptcha,
}: AwaitForCaptchaParams): Promise<string> => {
  return new Promise((resolve, reject) => {
    showModal('captcha', {variant: type});

    app.once('captcha-data', (data: CaptchaDataTypes) => {
      hideModal('captcha');

      if (!data) {
        reject('data is null');
      }

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
