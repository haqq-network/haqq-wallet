import React, {useRef, useState} from 'react';

import {ScrollView, StyleSheet, View} from 'react-native';

import {Button, ButtonVariant, Loading, Spacer} from '@app/components/ui';
import {I18N} from '@app/i18n';

import {StakingActive, StakingActiveInterface} from './staking-active';
import {StakingEmpty} from './staking-empty';

export type StakingHomeProps = {
  loading: boolean;
  availableSum: number;
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

  const canGetRewards = rewardsSum > 0;

  const handleGetRewards = () => {
    stakingActiveRef.current?.getReward();
    setIsAnimation(true);
    setTimeout(() => setIsAnimation(false), 2000);
    onPressGetRewards?.();
  };

  const hasStaking = stakingSum > 0.0001;

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
        <Spacer height={12} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
