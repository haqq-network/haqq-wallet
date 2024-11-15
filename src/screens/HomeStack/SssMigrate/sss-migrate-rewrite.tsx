import React, {memo, useCallback} from 'react';

import {SssMigrateRewrite} from '@app/components/sss-migrate-rewrite/sss-migrate-rewrite';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  SssMigrateStackParamList,
  SssMigrateStackRoutes,
} from '@app/route-types';

export const SssMigrateRewriteScreen = memo(() => {
  const navigation = useTypedNavigation<SssMigrateStackParamList>();
  const route = useTypedRoute<
    SssMigrateStackParamList,
    SssMigrateStackRoutes.SssMigrateRewrite
  >();

  const onCancel = useCallback(() => {
    navigation.pop(2);
  }, [navigation]);

  return (
    <SssMigrateRewrite
      provider={route.params.provider}
      email={route.params.email}
      onCancel={onCancel}
    />
  );
});
