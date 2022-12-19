import React, {useRef, useState} from 'react';

import {ScrollView, View} from 'react-native';

import {Button, ButtonVariant, Loading} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {IS_IOS} from '@app/variables';

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

  const hasStaking = stakingSum > 0;

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={[
        styles.content,
        !hasStaking && styles.contentEmpty,
      ]}
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
    marginBottom: 20,
  },
  content: {
    height: IS_IOS ? '100%' : 'auto',
    justifyContent: 'space-between',
  },
  contentEmpty: {
    height: '100%',
  },
});
