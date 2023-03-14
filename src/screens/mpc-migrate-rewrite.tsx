import React, {useCallback} from 'react';

import {MpcMigrateRewrite} from '@app/components/mpc-migrate-rewrite/mpc-migrate-rewrite';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const MpcMigrateRewriteScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'mpcMigrateAgreement'>();
  const onDone = useCallback(() => {
    navigation.navigate('mpcMigrateNetworks', {
      accountId: route.params.accountId,
    });
  }, [navigation, route.params.accountId]);

  const onCancel = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  return <MpcMigrateRewrite onDone={onDone} onCancel={onCancel} />;
};
