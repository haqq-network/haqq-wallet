import React, {useCallback, useRef} from 'react';

import {METADATA_URL} from '@env';
import {decryptShare, getMetadataValue} from '@haqq/shared-react-native';

import {PinInterface} from '@app/components/pin';
import {SssPin} from '@app/components/sss-pin';
import {app} from '@app/contexts';
import {SssError} from '@app/helpers/sss-error';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const SignInPinScreen = () => {
  const pinRef = useRef<PinInterface>();
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'signinPin'>();

  const onPin = useCallback(
    async (password: string) => {
      if (route.params.type === 'sss') {
        try {
          if (!route.params.sssPrivateKey) {
            throw new SssError('signinNotExists');
          }

          const securityQuestion = await getMetadataValue(
            METADATA_URL,
            route.params.sssPrivateKey,
            'securityQuestion',
          );

          if (!securityQuestion) {
            throw new SssError('signinNotExists');
          }

          await decryptShare(JSON.parse(securityQuestion), password);

          if (app.onboarded) {
            navigation.navigate('signinStoreWallet', {
              ...route.params,
              type: 'sss',
              sssPrivateKey: route.params.sssPrivateKey,
              sssCloudShare: null,
            });
          } else {
            navigation.navigate('onboardingSetupPin', {
              ...route.params,
              type: 'sss',
              sssPrivateKey: route.params.sssPrivateKey,
              sssCloudShare: null,
            });
          }
        } catch (e) {
          vibrate(HapticEffects.error);
          pinRef.current?.reset?.();

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
          ? 'signinStoreWallet'
          : 'onboardingSetupPin';

        navigation.navigate(nextScreen, route.params);
      }
    },
    [navigation, route.params],
  );

  return <SssPin onPin={onPin} pinRef={pinRef} />;
};
