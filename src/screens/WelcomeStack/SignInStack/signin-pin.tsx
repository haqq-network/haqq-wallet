import React, {memo, useCallback, useRef} from 'react';

import {PinInterface} from '@app/components/pin';
import {SssPin} from '@app/components/sss-pin';
import {app} from '@app/contexts';
import {decryptLocalShare} from '@app/helpers/sss';
import {SssError} from '@app/helpers/sss-error';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N, getText} from '@app/i18n';
import {SignInStackParamList, SignInStackRoutes} from '@app/route-types';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {PIN_BANNED_ATTEMPTS} from '@app/variables/common';

export const SignInPinScreen = memo(() => {
  const pinRef = useRef<PinInterface>();
  const navigation = useTypedNavigation<SignInStackParamList>();
  const route = useTypedRoute<
    SignInStackParamList,
    SignInStackRoutes.SigninPin
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

          const sssLocalShare = await decryptLocalShare(
            route.params.sssPrivateKey,
            password,
          );

          if (app.onboarded) {
            navigation.navigate(SignInStackRoutes.SigninStoreWallet, {
              ...route.params,
              type: 'sss',
              sssPrivateKey: route.params.sssPrivateKey,
              sssCloudShare: null,
              sssLocalShare,
            });
          } else {
            navigation.navigate(SignInStackRoutes.OnboardingSetupPin, {
              ...route.params,
              type: 'sss',
              sssPrivateKey: route.params.sssPrivateKey,
              sssCloudShare: null,
              sssLocalShare,
            });
          }
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
          ? SignInStackRoutes.SigninStoreWallet
          : SignInStackRoutes.OnboardingSetupPin;

        navigation.navigate(nextScreen, route.params);
      }
    },
    [navigation, route.params],
  );

  return <SssPin onPin={onPin} pinRef={pinRef} />;
});
