import React, {memo} from 'react';

import {GoogleSignin} from '@react-native-google-signin/google-signin';

import {CloudProblems} from '@app/components/cloud-problems';
import {verifyCloud} from '@app/helpers/verify-cloud';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  SignInStackParamList,
  SignInStackRoutes,
} from '@app/screens/WelcomeStack/SignInStack';

export const CloudProblemsScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();
  const route = useTypedRoute<
    SignInStackParamList,
    SignInStackRoutes.SigninCloudProblems
  >();
  const {sssProvider, onNext} = route.params;
  const onPrimaryPress = async () => {
    try {
      Promise.all([GoogleSignin.revokeAccess(), GoogleSignin.signOut()]);
    } catch (err) {
      Logger.log('GoogleSignin', err);
    }
    const hasPermissions = await verifyCloud(sssProvider);
    if (hasPermissions) {
      onNext();
    }
  };

  const onSecondaryPress = () => {
    navigation.goBack();
  };
  return (
    <CloudProblems
      provider={sssProvider}
      onPrimaryPress={onPrimaryPress}
      onSecondaryPress={onSecondaryPress}
    />
  );
});
