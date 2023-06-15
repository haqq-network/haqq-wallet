import React, {useCallback, useEffect} from 'react';

import {SssMigrateFinish} from '@app/components/sss-migrate-finish';
import {hideModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const SssMigrateFinishScreen = () => {
  const navigation = useTypedNavigation();

  useEffect(() => {
    hideModal('loading');
    vibrate(HapticEffects.success);
  }, []);

  const onSubmit = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  return <SssMigrateFinish onSubmit={onSubmit} />;
};
