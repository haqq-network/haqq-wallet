import React, {useCallback} from 'react';

import {CreateAgreement} from '@app/components/create-agreement';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const SignUpAgreementScreen = () => {
  const navigation = useTypedNavigation();
  const {nextScreen} = useTypedRoute<'createAgreement'>().params;

  const onPressAgree = useCallback(() => {
    // @ts-ignore
    return navigation.navigate(nextScreen ?? 'onboardingSetupPin', {
      type: 'empty',
    });
  }, [navigation, nextScreen]);

  return <CreateAgreement testID="signup_agreement" onDone={onPressAgree} />;
};
