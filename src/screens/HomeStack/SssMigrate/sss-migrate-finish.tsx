import React, {memo, useCallback, useEffect} from 'react';

import {SssMigrateFinish} from '@app/components/sss-migrate-finish';
import {hideModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {SssMigrateStackParamList} from '@app/screens/HomeStack/SssMigrate';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const SssMigrateFinishScreen = memo(() => {
  const navigation = useTypedNavigation<SssMigrateStackParamList>();

  useEffect(() => {
    hideModal('loading');
    vibrate(HapticEffects.success);
  }, []);

  const onSubmit = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  return <SssMigrateFinish onSubmit={onSubmit} />;
});
