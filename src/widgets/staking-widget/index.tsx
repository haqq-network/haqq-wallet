import React, {memo, useCallback, useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {onStakingRewards} from '@app/event-actions/on-staking-rewards';
import {Events} from '@app/events';
import {sumReduce} from '@app/helpers/staking';
import {useTypedNavigation} from '@app/hooks';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Balance} from '@app/services/balance';
import {StakingWidget} from '@app/widgets/staking-widget/staking-widget';

export const StakingWidgetWrapper = memo(function StakingWidgetWrapper() {
  const navigation = useTypedNavigation();
  const onPress = useCallback(() => {
    navigation.navigate('staking');
  }, [navigation]);

  const [rewardAmount, setRewardAmount] = useState(new Balance(0));

  useEffect(() => {
    const rows = StakingMetadata.getAll();

    const listener = () => {
      const rewards = rows.filter(
        val => val.type === StakingMetadataType.reward,
      );
      const rewardsSum = new Balance(sumReduce(rewards));

      setRewardAmount(rewardsSum);
    };

    rows.addListener(listener);
    app.addListener(Events.onBalanceSync, listener);
    return () => {
      rows.removeListener(listener);
      app.removeListener(Events.onBalanceSync, listener);
    };
  }, []);

  return (
    <StakingWidget
      onPress={onPress}
      onGetReward={onStakingRewards}
      rewardAmount={rewardAmount}
    />
  );
});
