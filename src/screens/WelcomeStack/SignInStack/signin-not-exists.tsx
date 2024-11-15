import {memo, useCallback} from 'react';

import {SigninNotExists} from '@app/components/signin-not-exists';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {AppStore} from '@app/models/app';
import {
  HomeStackRoutes,
  SignInStackParamList,
  SignInStackRoutes,
  SignUpStackRoutes,
} from '@app/route-types';

export const SigninNotExistsScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();
  const {provider, email, ...params} = useTypedRoute<
    SignInStackParamList,
    SignInStackRoutes.SigninNotExists
  >().params;

  const onPressCreate = useCallback(() => {
    if (AppStore.isOnboarded) {
      //@ts-ignore
      navigation.navigate(HomeStackRoutes.SignUp, {
        screen: SignUpStackRoutes.SignupStoreWallet,
        params,
      });
      return;
    }
    //@ts-ignore
    navigation.replace(SignInStackRoutes.OnboardingSetupPin, {
      ...params,
      provider,
    });
  }, [navigation, params]);

  const onPressChoice = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SigninNotExists
      onPressCreate={onPressCreate}
      onPressChoice={onPressChoice}
      //@ts-ignore
      provider={provider}
      email={email}
    />
  );
});
