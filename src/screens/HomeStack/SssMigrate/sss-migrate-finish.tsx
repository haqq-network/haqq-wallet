import React, {memo, useCallback, useEffect} from 'react';

import {SssMigrateFinish} from '@app/components/sss-migrate-finish';
import {hideModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {HomeStackRoutes} from '@app/screens/HomeStack';
import {SssMigrateStackParamList} from '@app/screens/HomeStack/SssMigrate';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType} from '@app/types';

export const SssMigrateFinishScreen = memo(() => {
  const navigation = useTypedNavigation<SssMigrateStackParamList>();

  useEffect(() => {
    hideModal(ModalType.loading);
    vibrate(HapticEffects.success);
  }, []);

  const onSubmit = useCallback(() => {
    navigation.navigate(HomeStackRoutes.Home);
  }, [navigation]);

  return <SssMigrateFinish onSubmit={onSubmit} />;
});
