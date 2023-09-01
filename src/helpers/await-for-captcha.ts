import {CaptchaDataTypes, CaptchaType} from '@app/components/captcha';
import {app} from '@app/contexts';

import {ModalName, hideModal, showModal} from './modal';

export interface AwaitForCaptchaParams {
  variant?: CaptchaType;
}

export interface AwaitForCaptchaResult {
  token: string;
  variant: CaptchaType;
}

export const awaitForCaptcha = ({
  variant = CaptchaType.hcaptcha,
}: AwaitForCaptchaParams): Promise<AwaitForCaptchaResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      showModal('captcha', {variant});

      const onData = (data: CaptchaDataTypes) => {
        app.off('captcha-data', onData);
        app.off('hideModal', onHideModal);

        hideModal('captcha');

        if (!data) {
          reject('data is null');
        }

        switch (data) {
          case 'cancel':
          case 'chalcancel':
          case 'chalexpired':
          case 'error':
          case 'expired':
          case 'click-outside':
            return reject?.(data);
          default:
            return resolve?.({
              token: data,
              variant,
            });
        }
      };

      const onHideModal = (event: {type: ModalName}) => {
        if (event?.type === 'captcha') {
          onData('cancel');
        }
      };

      app.on('captcha-data', onData);
      app.on('hideModal', onHideModal);
    } catch (err) {
      reject(err);
    }
  });
};
