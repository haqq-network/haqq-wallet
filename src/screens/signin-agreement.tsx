import React, {useCallback} from 'react';

import {RestoreAgreement} from '@app/components/restore-agreement/restore-agreement';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const SignInAgreementScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'signinAgreement'>();
  const onDone = useCallback(() => {
    navigation.navigate(route.params.nextScreen ?? 'signinRestoreWallet');
  }, [navigation, route.params.nextScreen]);

  return <RestoreAgreement onDone={onDone} testID="signin_agreement" />;
};
