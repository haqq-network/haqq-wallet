import React, {useCallback} from 'react';

import {CreateAgreement} from '@app/components/create-agreement';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const SignUpAgreementScreen = () => {
  const navigation = useTypedNavigation();
  const {nextScreen} = useTypedRoute<'createAgreement'>().params;

  const onPressAgree = useCallback(() => {
    navigation.navigate(nextScreen ?? 'onboardingSetupPin');
  }, [navigation, nextScreen]);

  return <CreateAgreement testID="signup_agreement" onDone={onPressAgree} />;
};
