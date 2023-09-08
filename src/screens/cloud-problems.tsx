import React, {memo} from 'react';

import {CloudProblems} from '@app/components/cloud-problems';
import {verifyCloud} from '@app/helpers/verify-cloud';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const CloudProblemsScreen = memo(() => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'cloudProblems'>();
  const {sssProvider, onNext} = route.params;
  const onPrimaryPress = async () => {
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
