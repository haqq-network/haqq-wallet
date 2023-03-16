import React, {useCallback} from 'react';

import {SigninNotExists} from '@app/components/signin-not-exists';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const SigninNotExistsScreen = () => {
  const navigation = useTypedNavigation();
  const {provider, email} = useTypedRoute<'signinNotExists'>().params;

  const onPressCreate = useCallback(() => {
    navigation.replace('signup', {next: ''});
  }, [navigation]);

  const onPressChoice = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SigninNotExists
      onPressCreate={onPressCreate}
      onPressChoice={onPressChoice}
      provider={provider}
      email={email}
    />
  );
};
