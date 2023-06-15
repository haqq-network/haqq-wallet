import React, {useCallback} from 'react';

import {SssMigrateAgreement} from '@app/components/sss-migrate-agreement/sss-migrate-agreement';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const SssMigrateAgreementScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'sssMigrateAgreement'>();
  const onDone = useCallback(() => {
    navigation.navigate('sssMigrateNetworks', {
      accountId: route.params.accountId,
    });
  }, [navigation, route.params.accountId]);

  return <SssMigrateAgreement onDone={onDone} />;
};
