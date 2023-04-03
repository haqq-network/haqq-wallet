import React, {useCallback, useRef} from 'react';

import {METADATA_URL} from '@env';
import {decryptShare} from '@haqq/provider-mpc-react-native';
import {getMetadataValue} from '@haqq/shared-react-native';

import {MpcPin} from '@app/components/mpc-pin';
import {PinInterface} from '@app/components/pin';
import {captureException} from '@app/helpers';
import {MpcError} from '@app/helpers/mpc-error';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';

export const SignupPinScreen = () => {
  const pinRef = useRef<PinInterface>();
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'signupPin'>();
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

          const nextScreen = user.onboarded
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
              captureException(e, 'mpc backup check password');
            }
          }
        }
      } else {
        const nextScreen = user.onboarded
          ? 'signupStoreWallet'
          : 'onboardingSetupPin';

        navigation.navigate(nextScreen, route.params);
      }
    },
    [navigation, route.params, user.onboarded],
  );

  return <MpcPin onPin={onPin} pinRef={pinRef} />;
};
