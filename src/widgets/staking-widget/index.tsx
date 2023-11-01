import React, {memo, useCallback} from 'react';

import {onStakingRewards} from '@app/event-actions/on-staking-rewards';
import {useTypedNavigation} from '@app/hooks';
import {useStakingReward} from '@app/hooks/use-staking-reward';
import {StakingWidget} from '@app/widgets/staking-widget/staking-widget';

const StakingWidgetWrapper = memo(() => {
  const navigation = useTypedNavigation();
  const rewardAmount = useStakingReward();

  const onPress = useCallback(() => {
    navigation.navigate('homeEarn', {screen: 'staking'});
  }, [navigation]);

  return (
    <StakingWidget
      onPress={onPress}
      onGetReward={onStakingRewards}
      rewardAmount={rewardAmount}
    />
  );
});

export {StakingWidgetWrapper};
