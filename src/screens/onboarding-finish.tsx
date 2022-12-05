import React, {useCallback, useEffect, useMemo} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {hideModal} from '@app/helpers';
import {useApp, useWallets} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {Finish} from '../components/finish';
import {RootStackParamList} from '../types';

export const OnboardingFinishScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'createFinish'>>();
  const app = useApp();
  const wallets = useWallets();
  const title = useMemo(
    () =>
      route.params.action === 'create'
        ? 'Congratulations!\nYou have successfully added a new account'
        : 'Congratulations!\nYou have successfully recovered an account',
    [route.params.action],
  );

  const onEnd = useCallback(() => {
    if (app.getUser().onboarded) {
      navigation.getParent()?.goBack();
    } else {
      app.getUser().onboarded = true;
      navigation.replace('home');
    }
    requestAnimationFrame(async () => {
      await wallets.checkForBackup(app.snoozeBackup);
    });
  }, [app, navigation, wallets]);

  useEffect(() => {
    hideModal();
    vibrate(HapticEffects.success);
  }, []);

  return <Finish title={title} onFinish={onEnd} testID="onboarding_finish" />;
};
