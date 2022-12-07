import React, {useCallback, useEffect, useState} from 'react';

import {useWindowDimensions} from 'react-native';

import {StakingInfo} from '@app/components/staking-info';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {
  useCosmos,
  useTypedNavigation,
  useTypedRoute,
  useWallets,
} from '@app/hooks';
import {I18N} from '@app/i18n';
import {StakingMetadata} from '@app/models/staking-metadata';

export const StakingInfoScreen = () => {
  const {validator} = useTypedRoute<'stakingInfo'>().params;
  const {operator_address} = validator;
  const navigation = useTypedNavigation();

  const {visible} = useWallets();
  const cosmos = useCosmos();

  const [withdrawDelegatorRewardProgress, setWithdrawDelegatorRewardProgress] =
    useState(false);
  const [rewards, setRewards] = useState<Realm.Results<StakingMetadata> | null>(
    null,
  );

  const closeDistance = useWindowDimensions().height / 6;

  useEffect(() => {
    const r = StakingMetadata.getRewardsForValidator(operator_address);

    const subscription = () => {
      setRewards(StakingMetadata.getRewardsForValidator(operator_address));
    };

    r.addListener(subscription);
    setRewards(r);
    return () => {
      r.removeListener(subscription);
    };
  }, [operator_address]);

  const onWithdrawDelegatorReward = useCallback(() => {
    if (rewards?.length) {
      setWithdrawDelegatorRewardProgress(true);
      const delegators = new Set(rewards.map(r => r.delegator));

      Promise.all(
        visible
          .filter(w => delegators.has(w.cosmosAddress))
          .map(w =>
            cosmos.withdrawDelegatorReward(w.address, operator_address),
          ),
      )
        .then(() => {
          rewards.forEach(r => StakingMetadata.remove(r.hash));
        })
        .finally(() => {
          setWithdrawDelegatorRewardProgress(false);
        });
    }
  }, [cosmos, rewards, operator_address, visible]);

  const onDelegate = useCallback(
    (address?: string) => {
      if (address) {
        navigation.push('stakingDelegate', {
          validator: operator_address,
          selectedWalletAddress: address,
        });
      } else {
        showModal('wallets-bottom-sheet', {
          wallets: visible,
          closeDistance,
          title: I18N.stakingDelegateAccountTitle,
          eventSuffix: '-delegate',
        });
      }
    },

    [navigation, operator_address, visible, closeDistance],
  );

  const onUnDelegate = useCallback(
    (address?: string) => {
      const delegations = new Set(
        StakingMetadata.getDelegationsForValidator(operator_address).map(
          v => v.delegator,
        ),
      );
      const available = visible.filter(w => delegations.has(w.cosmosAddress));

      if (address) {
        navigation.push('stakingUnDelegate', {
          validator: operator_address,
          selectedWalletAddress: address,
        });
      } else {
        showModal('wallets-bottom-sheet', {
          wallets: available,
          closeDistance,
          title: I18N.stakingDelegateAccountTitle,
          eventSuffix: '-undelegate',
        });
      }
    },

    [navigation, operator_address, closeDistance, visible],
  );

  useEffect(() => {
    app.addListener('wallet-selected-delegate', onDelegate);
    app.addListener('wallet-selected-undelegate', onUnDelegate);
    return () => {
      app.removeListener('wallet-selected-delegate', onDelegate);
      app.removeListener('wallet-selected-undelegate', onUnDelegate);
    };
  }, [onDelegate, onUnDelegate]);

  const delegated =
    StakingMetadata.getDelegationsForValidator(operator_address);

  return (
    <StakingInfo
      withdrawDelegatorRewardProgress={withdrawDelegatorRewardProgress}
      validator={validator}
      onDelegate={onDelegate}
      onUnDelegate={onUnDelegate}
      onWithdrawDelegatorReward={onWithdrawDelegatorReward}
      delegations={delegated}
      rewards={rewards}
    />
  );
};
