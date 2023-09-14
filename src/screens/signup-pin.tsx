import React, {useCallback, useRef} from 'react';

import {METADATA_URL} from '@env';
import {decryptShare, getMetadataValue} from '@haqq/shared-react-native';

import {PinInterface} from '@app/components/pin';
import {SssPin} from '@app/components/sss-pin';
import {app} from '@app/contexts';
import {SssError} from '@app/helpers/sss-error';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {RemoteConfig} from '@app/services/remote-config';

export const SignupPinScreen = () => {
  const pinRef = useRef<PinInterface>();
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'signupPin'>();

  const onPin = useCallback(
    async (password: string) => {
      if (route.params.type === 'sss') {
        try {
          if (!route.params.sssPrivateKey) {
            throw new SssError('signinNotExists');
          }

          const securityQuestion = await getMetadataValue(
            RemoteConfig.get_env('sss_metadata_url', METADATA_URL) as string,
            route.params.sssPrivateKey,
            'socialShareIndex',
          );

          if (!securityQuestion) {
            throw new SssError('signinNotExists');
          }

          await decryptShare(JSON.parse(securityQuestion), password);

          const nextScreen = app.onboarded
            ? 'signupStoreWallet'
            : 'onboardingSetupPin';

          navigation.navigate(nextScreen, {
            ...route.params,
          });
        } catch (e) {
          if (e instanceof Error) {
            if ('code' in e && e.code === 2103) {
              throw new Error('wrong_password');
            } else {
              Logger.captureException(e, 'sss backup check password');
            }
          }
        }
      } else {
        const nextScreen = app.onboarded
          ? 'signupStoreWallet'
          : 'onboardingSetupPin';

        navigation.navigate(nextScreen, route.params);
      }
    },
    [navigation, route.params],
  );

  return <SssPin onPin={onPin} pinRef={pinRef} />;
};
