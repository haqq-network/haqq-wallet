import React, {memo, useCallback} from 'react';

import {useTypedNavigation} from '@app/hooks';
import {Balance} from '@app/services/balance';
import {StakingWidget} from '@app/widgets/staking-widget/staking-widget';

const StakingWidgetWrapper = memo(() => {
  const navigation = useTypedNavigation();
  const onPress = useCallback(() => {
    navigation.navigate('staking');
  }, [navigation]);
  return (
    <StakingWidget
      onPress={onPress}
      onGetReward={() => {}}
      rewardAmount={new Balance(123456)}
    />
  );
});

export {StakingWidgetWrapper};
