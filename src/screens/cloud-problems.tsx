import React, {memo} from 'react';

import {CloudProblems} from '@app/components/cloud-problems';
import {app} from '@app/contexts';
import {cleanGoogle, getGoogleTokens} from '@app/helpers/get-google-tokens';
import {verifyCloud} from '@app/helpers/verify-cloud';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {AppStore} from '@app/models/app';
import {SignInStackParamList, SignInStackRoutes} from '@app/route-types';
import {SssProviders} from '@app/services/provider-sss';

const logger = Logger.create('CloudProblemsScreen', {
  enabled: __DEV__ || app.isTesterMode || AppStore.isDeveloperModeEnabled,
});

export const CloudProblemsScreen = memo(() => {
  logger.log('Rendering CloudProblemsScreen component');

  const navigation = useTypedNavigation<SignInStackParamList>();
  logger.log('Initialized navigation with useTypedNavigation');

  const route = useTypedRoute<
    SignInStackParamList,
    SignInStackRoutes.SigninCloudProblems
  >();
  logger.log('Initialized route with useTypedRoute');

  const {sssProvider, onNext} = route.params;
  logger.log('Destructured sssProvider and onNext from route.params:', {
    sssProvider,
    onNext,
  });

  const onPrimaryPress = async () => {
    logger.log('onPrimaryPress function called');
    if (route.params.sssProvider === SssProviders.google) {
      logger.log('SSS provider is Google, cleaning Google data');
      await cleanGoogle();
      logger.log('Getting new Google tokens');
      await getGoogleTokens();
    }
    logger.log('Verifying cloud permissions for provider:', sssProvider);
    const hasPermissions = await verifyCloud(sssProvider);
    logger.log('Cloud permissions verification result:', hasPermissions);
    if (hasPermissions) {
      logger.log('Permissions granted, calling onNext function');
      onNext();
    }
  };

  const onSecondaryPress = () => {
    logger.log('onSecondaryPress function called, navigating back');
    navigation.goBack();
  };

  logger.log('Rendering CloudProblems component');
  return (
    <CloudProblems
      provider={sssProvider}
      onPrimaryPress={onPrimaryPress}
      onSecondaryPress={onSecondaryPress}
    />
  );
});
