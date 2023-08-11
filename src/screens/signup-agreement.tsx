import React, {memo, useCallback} from 'react';

import {CreateAgreement} from '@app/components/create-agreement';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  SignUpStackParamList,
  SignUpStackRoutes,
} from '@app/screens/WelcomeStack/SignUpStack';

export const SignUpAgreementScreen = memo(() => {
  const navigation = useTypedNavigation<SignUpStackParamList>();
  const {nextScreen} = useTypedRoute<
    SignUpStackParamList,
    SignUpStackRoutes.SignUpAgreement
  >().params;

  const onPressAgree = useCallback(() => {
    return navigation.navigate(nextScreen, {
      type: 'empty',
    });
  }, [navigation, nextScreen]);

  return <CreateAgreement testID="signup_agreement" onDone={onPressAgree} />;
});
