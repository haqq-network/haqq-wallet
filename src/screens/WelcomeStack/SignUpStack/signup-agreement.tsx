import React, {memo, useCallback} from 'react';

import {CreateAgreement} from '@app/components/create-agreement';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {SignUpStackParamList, SignUpStackRoutes} from '@app/route-types';

export const SignUpAgreementScreen = memo(() => {
  const navigation = useTypedNavigation<SignUpStackParamList>();
  const params = useTypedRoute<
    SignUpStackParamList,
    SignUpStackRoutes.SignUpAgreement
  >().params;
  const onPressAgree = useCallback(() => {
    //@ts-ignore
    return navigation.navigate(params.nextScreen, {
      //@ts-ignore
      type: params.type || 'empty',
      //@ts-ignore
      provider: params.provider || undefined,
    });
  }, [navigation, params.nextScreen]);

  return <CreateAgreement testID="signup_agreement" onDone={onPressAgree} />;
});
