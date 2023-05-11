import React, {useCallback, useRef} from 'react';

import {METADATA_URL} from '@env';
import {decryptShare, getMetadataValue} from '@haqq/shared-react-native';

import {MpcPin} from '@app/components/mpc-pin';
import {PinInterface} from '@app/components/pin';
import {captureException} from '@app/helpers';
import {MpcError} from '@app/helpers/mpc-error';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const SignInPinScreen = () => {
  const pinRef = useRef<PinInterface>();
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'signinPin'>();
  const user = useUser();

  const onPin = useCallback(
    async (password: string) => {
      if (route.params.type === 'mpc') {
        try {
          if (!route.params.mpcPrivateKey) {
            throw new MpcError('signinNotExists');
          }

          const securityQuestion = await getMetadataValue(
            METADATA_URL,
            route.params.mpcPrivateKey,
            'securityQuestion',
          );

          if (!securityQuestion) {
            throw new MpcError('signinNotExists');
          }

          await decryptShare(JSON.parse(securityQuestion), password);

          if (user.onboarded) {
            navigation.navigate('signinStoreWallet', {
              ...route.params,
              type: 'mpc',
              mpcPrivateKey: route.params.mpcPrivateKey,
              mpcCloudShare: null,
            });
          } else {
            navigation.navigate('onboardingSetupPin', {
              ...route.params,
              type: 'mpc',
              mpcPrivateKey: route.params.mpcPrivateKey,
              mpcCloudShare: null,
            });
          }
        } catch (e) {
          vibrate(HapticEffects.error);
          pinRef.current?.reset?.();

          if (e instanceof Error) {
            if ('code' in e && e.code === 2103) {
              throw new Error('wrong_password');
            } else {
              captureException(e, 'mpc backup check password');
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

  return <MpcPin onPin={onPin} pinRef={pinRef} />;
};
