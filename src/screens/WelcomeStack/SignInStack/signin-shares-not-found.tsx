import React, {memo, useCallback} from 'react';

import {SigninSharesNotFound} from '@app/components/signin-shares-not-found';
import {useTypedNavigation} from '@app/hooks';
import {SignInStackParamList, SignInStackRoutes} from '@app/route-types';

export const SigninSharesNotFoundScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();

  const onPrimaryPress = useCallback(() => {
    navigation.pop(2);
  }, [navigation]);

  const onSecondaryPress = useCallback(() => {
    navigation.navigate(SignInStackRoutes.SigninAgreement);
  }, [navigation]);

  return (
    <SigninSharesNotFound
      onPrimaryPress={onPrimaryPress}
      onSecondaryPress={onSecondaryPress}
    />
  );
});
