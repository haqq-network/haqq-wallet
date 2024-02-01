import React, {memo, useCallback} from 'react';

import {RestoreAgreement} from '@app/components/restore-agreement/restore-agreement';
import {useTypedNavigation} from '@app/hooks';
import {SignInStackParamList, SignInStackRoutes} from '@app/route-types';

export const SignInAgreementScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();

  const onDone = useCallback(() => {
    navigation.navigate(SignInStackRoutes.SigninRestoreWallet);
  }, [navigation]);

  return <RestoreAgreement onDone={onDone} testID="signin_agreement" />;
});
