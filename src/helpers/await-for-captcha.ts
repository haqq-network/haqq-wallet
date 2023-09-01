import {CaptchaDataTypes, CaptchaType} from '@app/components/captcha';
import {app} from '@app/contexts';

import {ModalName, hideModal, showModal} from './modal';

export interface AwaitForCaptchaParams {
  type?: CaptchaType;
}

export const awaitForCaptcha = ({
  type = CaptchaType.hcaptcha,
}: AwaitForCaptchaParams): Promise<string> => {
  return new Promise((resolve, reject) => {
    showModal('captcha', {variant: type});

    const onData = (data: CaptchaDataTypes) => {
      hideModal('captcha');

      if (!data) {
        reject('data is null');
      }

      app.off('captcha-data', onData);
      app.off('hideModal', onHideModal);

      switch (data) {
        case 'cancel':
        case 'chalcancel':
        case 'chalexpired':
        case 'error':
        case 'expired':
        case 'click-outside':
          return reject?.(data);
        default:
          return resolve?.(data);
      }
    };

    const onHideModal = (event: {type: ModalName}) => {
      if (event?.type === 'captcha') {
        onData('cancel');
      }
    };

    app.on('captcha-data', onData);
    app.on('hideModal', onHideModal);
  });
};
