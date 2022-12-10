import React, {useCallback} from 'react';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {CreateAgreement} from '@app/components/create-agreement';

export const SignUpAgreementScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'createAgreement'>();

  const onPressAgree = useCallback(() => {
    navigation.navigate(route.params.nextScreen ?? 'onboardingSetupPin');
  }, [navigation, route.params.nextScreen]);

  return (
    <CreateAgreement
      testID="signup_agreement"
      onDone={onPressAgree}
    />
  );
};
