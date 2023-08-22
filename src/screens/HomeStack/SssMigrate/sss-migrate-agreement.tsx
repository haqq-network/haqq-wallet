import React, {memo, useCallback} from 'react';

import {SssMigrateAgreement} from '@app/components/sss-migrate-agreement/sss-migrate-agreement';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  SssMigrateStackParamList,
  SssMigrateStackRoutes,
} from '@app/screens/HomeStack/SssMigrate';

export const SssMigrateAgreementScreen = memo(() => {
  const navigation = useTypedNavigation<SssMigrateStackParamList>();
  const route = useTypedRoute<
    SssMigrateStackParamList,
    SssMigrateStackRoutes.SssMigrateAgreement
  >();
  const onDone = useCallback(() => {
    navigation.navigate(SssMigrateStackRoutes.SssMigrateNetworks, {
      accountId: route.params.accountId,
    });
  }, [navigation, route.params.accountId]);

  return <SssMigrateAgreement onDone={onDone} />;
});
