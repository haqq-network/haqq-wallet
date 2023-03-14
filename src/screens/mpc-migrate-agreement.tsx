import React, {useCallback} from 'react';

import {MpcMigrateAgreement} from '@app/components/mpc-migrate-agreement/mpc-migrate-agreement';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const MpcMigrateAgreementScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'mpcMigrateAgreement'>();
  const onDone = useCallback(() => {
    navigation.navigate('mpcMigrateNetworks', {
      accountId: route.params.accountId,
    });
  }, [navigation, route.params.accountId]);

  return <MpcMigrateAgreement onDone={onDone} />;
};
