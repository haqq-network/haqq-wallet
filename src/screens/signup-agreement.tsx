import React, {useCallback} from 'react';

import {CreateAgreement} from '@app/components/create-agreement';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const SignUpAgreementScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'createAgreement'>();

  const onPressAgree = useCallback(() => {
    navigation.navigate(route.params.nextScreen ?? 'onboardingSetupPin');
  }, [navigation, route.params.nextScreen]);

  return <CreateAgreement testID="signup_agreement" onDone={onPressAgree} />;
};
