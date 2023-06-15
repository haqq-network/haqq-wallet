import React, {useCallback, useRef} from 'react';

import {METADATA_URL} from '@env';
import {decryptShare, getMetadataValue} from '@haqq/shared-react-native';

import {PinInterface} from '@app/components/pin';
import {SssPin} from '@app/components/sss-pin';
import {captureException} from '@app/helpers';
import {SssError} from '@app/helpers/sss-error';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const SignInPinScreen = () => {
  const pinRef = useRef<PinInterface>();
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'signinPin'>();
  const user = useUser();

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

          if (user.onboarded) {
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
              captureException(e, 'sss backup check password');
            }
          }
        }
      } else {
        const nextScreen = user.onboarded
          ? 'signinStoreWallet'
          : 'onboardingSetupPin';

        navigation.navigate(nextScreen, route.params);
      }
    },
    [navigation, route.params, user.onboarded],
  );

  return <SssPin onPin={onPin} pinRef={pinRef} />;
};
