import React, {useCallback, useEffect} from 'react';

import {MpcMigrateFinish} from '@app/components/mpc-migrate-finish';
import {hideModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const MpcMigrateFinishScreen = () => {
  const navigation = useTypedNavigation();

  useEffect(() => {
    hideModal('loading');
    vibrate(HapticEffects.success);
  }, []);

  const onSubmit = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  return <MpcMigrateFinish onSubmit={onSubmit} />;
};
