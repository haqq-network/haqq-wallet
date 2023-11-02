import React, {useMemo, useRef, useState} from 'react';

import {ScrollView, View} from 'react-native';

import {Button, ButtonVariant, Loading, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {getRemoteBalanceValue} from '@app/helpers/get-remote-balance-value';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';

import {StakingActive, StakingActiveInterface} from './staking-active';
import {StakingEmpty} from './staking-empty';

export type StakingHomeProps = {
  loading: boolean;
  availableSum: Balance;
  stakingSum: Balance;
  rewardsSum: Balance;
  unDelegationSum: Balance;
  onPressValidators: () => void;
  onPressGetRewards?: () => void;
};

export const HomeStaking = ({
  loading,
  stakingSum,
  rewardsSum,
  availableSum,
  unDelegationSum,
  onPressValidators,
  onPressGetRewards,
}: StakingHomeProps) => {
  const [isAnimation, setIsAnimation] = useState(false);
  const stakingActiveRef = useRef<StakingActiveInterface>(null);

  const canGetRewards = useMemo(
    () =>
      rewardsSum.compare(
        getRemoteBalanceValue('staking_reward_min_amount'),
        'gte',
      ),
    [rewardsSum],
  );

  const handleGetRewards = () => {
    stakingActiveRef.current?.getReward();
    setIsAnimation(true);
    setTimeout(() => setIsAnimation(false), 2000);
    onPressGetRewards?.();
  };

  const hasStaking = useMemo(
    () =>
      stakingSum.compare(
        getRemoteBalanceValue('staking_reward_min_amount'),
        'gte',
      ),
    [stakingSum],
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.content}
      style={styles.container}>
      {hasStaking ? (
        <StakingActive
          ref={stakingActiveRef}
          stakedSum={stakingSum}
          rewardSum={rewardsSum}
          unDelegationSum={unDelegationSum}
          availableSum={availableSum}
        />
      ) : (
        <StakingEmpty availableSum={availableSum} />
      )}
      <View>
        {hasStaking && (
          <Button
            i18n={I18N.stakingHomeGetRewards}
            variant={ButtonVariant.second}
            disabled={!canGetRewards || isAnimation}
            onPress={handleGetRewards}
            style={styles.margin}
          />
        )}
        <Button
          i18n={I18N.stakingHomeValidators}
          variant={ButtonVariant.contained}
          onPress={onPressValidators}
          style={styles.margin}
        />
        <Spacer height={20} />
      </View>
    </ScrollView>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  margin: {
    marginVertical: 8,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
});
