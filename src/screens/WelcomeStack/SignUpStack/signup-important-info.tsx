import React, {memo, useMemo} from 'react';

import {SignupImportantInfo} from '@app/components/signup-important-info';
import {useTypedRoute} from '@app/hooks';
import {
  SignUpStackParamList,
  SignUpStackRoutes,
} from '@app/screens/WelcomeStack/SignUpStack';

export const SignUpImportantInfoScreen = memo(() => {
  const params = useTypedRoute<
    SignUpStackParamList,
    SignUpStackRoutes.SignupImportantInfo
  >().params;

  const readMoreLink = useMemo(() => '', []);

  return (
    <SignupImportantInfo onNext={params.onNext} readMoreLink={readMoreLink} />
  );
});
