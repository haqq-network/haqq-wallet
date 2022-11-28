import React, {useCallback, useMemo, useRef} from 'react';

import {ScrollView, View} from 'react-native';

import {Button, ButtonVariant, Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {useValidators, useWalletsList} from '@app/hooks';
import {I18N} from '@app/i18n';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Cosmos} from '@app/services/cosmos';
import {IS_IOS} from '@app/variables';

import {StakingActive, StakingActiveInterface} from './staking-active';
import {StakingEmpty} from './staking-empty';

export type StakingHomeProps = {
  onPressValidators: () => void;
  onPressGetRewards?: () => void;
};

export const HomeStaking = ({
  onPressValidators,
  onPressGetRewards,
}: StakingHomeProps) => {
  const {visible} = useWalletsList();
  const {loading, stakingSum, rewardsSum, unDelegationSum, stakedValidators} =
    useValidators();

  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const stakingActiveRef = useRef<StakingActiveInterface>(null);

  const availableSum = useMemo(() => {
    return visible.reduce((acc, w) => acc + w.balance, 0);
  }, [visible]);

  const onWithdrawDelegatorRewards = useCallback(() => {
    const rewards: Realm.Results<StakingMetadata>[] = stakedValidators.map(
      ({operator_address}) => {
        return StakingMetadata.getRewardsForValidator(operator_address);
      },
    );
    rewards.forEach(rewardItem => {
      if (rewardItem.length) {
        const delegators = new Set(rewardItem.map(r => r.delegator));

        Promise.all(
          visible
            .filter(w => delegators.has(w.cosmosAddress))
            .map(w =>
              stakedValidators.map(({operator_address}) =>
                cosmos.withdrawDelegatorReward(w.address, operator_address),
              ),
            )
            .flat(),
        ).then(() => {
          rewardItem.forEach(r => StakingMetadata.remove(r.hash));
        });
      }
    });
  }, [cosmos, stakedValidators, visible]);

  const canGetRewards = rewardsSum > 0;

  const handleGetRewards = () => {
    stakingActiveRef.current?.getReward();
    onPressGetRewards?.();
    onWithdrawDelegatorRewards();
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
            disabled={!canGetRewards}
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
