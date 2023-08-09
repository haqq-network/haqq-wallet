import React, {useMemo, useRef, useState} from 'react';

import {ScrollView, View} from 'react-native';

import {Button, ButtonVariant, Loading, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Balance} from '@app/types';
import {NUM_PRECISION} from '@app/variables/common';

import {StakingActive, StakingActiveInterface} from './staking-active';
import {StakingEmpty} from './staking-empty';

export type StakingHomeProps = {
  loading: boolean;
  availableSum: Balance;
  stakingSum: number;
  rewardsSum: number;
  unDelegationSum: number;
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
    () => rewardsSum >= 1 / NUM_PRECISION,
    [rewardsSum],
  );

  const handleGetRewards = () => {
    stakingActiveRef.current?.getReward();
    setIsAnimation(true);
    setTimeout(() => setIsAnimation(false), 2000);
    onPressGetRewards?.();
  };

  const hasStaking = useMemo(
    () => stakingSum >= 1 / NUM_PRECISION,
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
