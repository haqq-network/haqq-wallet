import React, {memo, useCallback, useRef} from 'react';

import {METADATA_URL} from '@env';
import {decryptShare} from '@haqq/shared-react-native';

import {PinInterface} from '@app/components/pin';
import {SssPin} from '@app/components/sss-pin';
import {app} from '@app/contexts';
import {SssError} from '@app/helpers/sss-error';
import {getMetadataValueWrapped} from '@app/helpers/wrappers/getMetadataValue';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N, getText} from '@app/i18n';
import {
  SignUpStackParamList,
  SignUpStackRoutes,
} from '@app/screens/WelcomeStack/SignUpStack';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {RemoteConfig} from '@app/services/remote-config';
import {PIN_BANNED_ATTEMPTS} from '@app/variables/common';

export const SignupPinScreen = memo(() => {
  const pinRef = useRef<PinInterface>();
  const navigation = useTypedNavigation<SignUpStackParamList>();
  const route = useTypedRoute<
    SignUpStackParamList,
    SignUpStackRoutes.SignUpPin
  >();

  useEffectAsync(async () => {
    await app.rehydrateUserAttempts();
    if (app.pinBanned) {
      pinRef.current?.locked(app.pinBanned);
    }
  }, []);

  const onPin = useCallback(
    async (password: string) => {
      if (route.params.type === 'sss') {
        try {
          if (!route.params.sssPrivateKey) {
            throw new SssError('signinNotExists');
          }

          const securityQuestion = await getMetadataValueWrapped(
            RemoteConfig.get_env('sss_metadata_url', METADATA_URL) as string,
            route.params.sssPrivateKey,
            'socialShareIndex',
          );

          if (!securityQuestion) {
            throw new SssError('signinNotExists');
          }

          await decryptShare(securityQuestion, password);

          const nextScreen = app.onboarded
            ? SignUpStackRoutes.SignupStoreWallet
            : SignUpStackRoutes.OnboardingSetupPin;

          navigation.navigate(nextScreen, route.params);
        } catch (e) {
          vibrate(HapticEffects.error);

          app.failureEnter();
          if (app.canEnter) {
            pinRef.current?.reset(
              getText(I18N.pinAttempts, {
                value: String(PIN_BANNED_ATTEMPTS - app.pinAttempts),
              }),
            );
          } else {
            pinRef.current?.locked(app.pinBanned);
          }

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
          ? SignUpStackRoutes.SignupStoreWallet
          : SignUpStackRoutes.OnboardingSetupPin;

        navigation.navigate(nextScreen, route.params);
      }
    },
    [navigation, route.params],
  );

  return <SssPin onPin={onPin} pinRef={pinRef} />;
});
