import React, {useCallback, useRef} from 'react';

import {initializeTKey} from '@haqq/provider-mpc-react-native';

import {MpcOldPin} from '@app/components/mpc-old-pin';
import {PinInterface} from '@app/components/pin';
import {captureException} from '@app/helpers';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {
  serviceProviderOptions,
  storageLayerOptions,
} from '@app/services/provider-mpc';

export const SignInOldPinScreen = () => {
  const pinRef = useRef<PinInterface>();
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'signinPin'>();
  const user = useUser();

  const onPin = useCallback(
    async (password: string) => {
      if (route.params.type === 'mpc') {
        try {
          const {securityQuestionsModule} = await initializeTKey(
            route.params.mpcPrivateKey,
            serviceProviderOptions as any,
            storageLayerOptions,
          );

          await securityQuestionsModule.inputShareFromSecurityQuestions(
            password,
          );

          navigation.navigate('signinPin', {
            type: 'mpc',
            mpcPrivateKey: route.params.mpcPrivateKey,
            mpcSecurityQuestion: password,
            mpcCloudShare: null,
          });
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

  return <MpcOldPin onPin={onPin} pinRef={pinRef} />;
};
