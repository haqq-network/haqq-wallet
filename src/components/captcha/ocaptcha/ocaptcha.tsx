import {useCallback, useEffect} from 'react';

import {appleAuth} from '@invertase/react-native-apple-authentication';

import {CaptchaDataTypes} from '@app/components/captcha';
import {getGoogleTokens} from '@app/helpers/get-google-tokens';
import {IS_IOS} from '@app/variables/common';

export type OcaptchaProps = {
  onData: (data: CaptchaDataTypes) => void;
};

export function Ocaptcha({onData}: OcaptchaProps) {
  const onCaptcha = useCallback(async () => {
    try {
      let token = '';

      if (IS_IOS) {
        const creds = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });

        token = creds.identityToken ?? '';
      } else {
        const creds = await getGoogleTokens();
        token = creds.idToken ?? '';
      }

      if (token === '') {
        throw new Error('token is empty');
      }

      Logger.log(token);

      onData(token as CaptchaDataTypes);
    } catch (e) {
      onData('error');
    }
  }, [onData]);

  useEffect(() => {
    onCaptcha();
  }, [onCaptcha]);
  return null;
}
