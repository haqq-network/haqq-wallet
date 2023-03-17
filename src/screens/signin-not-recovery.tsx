import React, {useCallback} from 'react';

import {Alert} from 'react-native';

import {SigninNotRecovery} from '@app/components/signin-not-recovery';
import {useTypedNavigation} from '@app/hooks';

export const SigninNotRecoveryScreen = () => {
  const navigation = useTypedNavigation();

  const onPressOldPin = useCallback(() => {
    Alert.alert('nothing');
  }, []);

  const onPressChange = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SigninNotRecovery
      onPressOldPin={onPressOldPin}
      onPressChange={onPressChange}
    />
  );
};
