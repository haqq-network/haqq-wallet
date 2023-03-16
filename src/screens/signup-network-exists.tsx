import React, {useCallback} from 'react';

import {SignupNetworkExists} from '@app/components/signup-network-exists';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';

export const SignupNetworkExistsScreen = () => {
  const user = useUser();
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'signupNetworkExists'>();
  const onRestore = useCallback(() => {}, []);
  const onRewrite = useCallback(() => {
    const nextScreen = user.onboarded
      ? 'signupStoreWallet'
      : 'onboardingSetupPin';
    navigation.navigate(nextScreen, route.params);
  }, [navigation, route.params, user.onboarded]);

  return <SignupNetworkExists onRestore={onRestore} onRewrite={onRewrite} />;
};
