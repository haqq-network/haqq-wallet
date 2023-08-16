import React, {useCallback} from 'react';

import {SigninNotRecovery} from '@app/components/signin-not-recovery';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const SigninNotRecoveryScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'signinNotRecovery'>();

  const onPressOldPin = useCallback(() => {
    navigation.navigate('signinPin', route.params);
  }, [navigation, route.params]);

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
