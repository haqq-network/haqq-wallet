import React, {useCallback} from 'react';

import {RestoreAgreement} from '@app/components/restore-agreement/restore-agreement';
import {useTypedNavigation} from '@app/hooks';

export const SignInAgreementScreen = () => {
  const navigation = useTypedNavigation();

  const onDone = useCallback(() => {
    navigation.navigate('signinRestoreWallet');
  }, [navigation]);

  return <RestoreAgreement onDone={onDone} testID="signin_agreement" />;
};
