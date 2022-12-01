import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useWindowDimensions} from 'react-native';

import {BottomSheet} from '@app/components/bottom-sheet';
import {StakingInfo} from '@app/components/staking-info';
import {Spacer} from '@app/components/ui';
import {WalletRow} from '@app/components/wallet-row';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Cosmos} from '@app/services/cosmos';

export const StakingInfoScreen = () => {
  const {validator} = useTypedRoute<'stakingInfo'>().params;
  const {operator_address} = validator;
  const navigation = useTypedNavigation();

  const {visible} = useWallets();
  const cosmos = useRef(new Cosmos(app.provider!)).current;

  const [withdrawDelegatorRewardProgress, setWithdrawDelegatorRewardProgress] =
    useState(false);
  const [rewards, setRewards] = useState<Realm.Results<StakingMetadata> | null>(
    null,
  );
  const [openWith, setOpenWith] = useState<string | false>(false);

  const closeDistance = useWindowDimensions().height / 6;

  const onCloseBottomSheet = () => setOpenWith(false);

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
      onCloseBottomSheet();
      if (address) {
        navigation.push('stakingDelegate', {
          validator: operator_address,
          selectedWalletAddress: address,
        });
      } else if (visible.length > 1) {
        setOpenWith('delegate');
      } else {
        navigation.push('stakingDelegate', {
          validator: operator_address,
          selectedWalletAddress: visible[0].address,
        });
      }
    },

    [navigation, operator_address, visible],
  );

  const available = useMemo(() => {
    const delegations = new Set(
      StakingMetadata.getDelegationsForValidator(operator_address).map(
        v => v.delegator,
      ),
    );
    return visible.filter(w => delegations.has(w.cosmosAddress));
  }, [visible, operator_address]);

  const onUnDelegate = useCallback(
    (address?: string) => {
      onCloseBottomSheet();

      if (address) {
        navigation.push('stakingUnDelegate', {
          validator: operator_address,
          selectedWalletAddress: address,
        });
      } else if (available.length > 1) {
        setOpenWith('undelegate');
      } else {
        navigation.push('stakingUnDelegate', {
          validator: operator_address,
          selectedWalletAddress: available[0].address,
        });
      }
    },

    [navigation, operator_address, available],
  );

  const delegated =
    StakingMetadata.getDelegationsForValidator(operator_address);

  const isDelegate = openWith === 'delegate';

  return (
    <>
      <StakingInfo
        withdrawDelegatorRewardProgress={withdrawDelegatorRewardProgress}
        validator={validator}
        onDelegate={onDelegate}
        onUnDelegate={onUnDelegate}
        onWithdrawDelegatorReward={onWithdrawDelegatorReward}
        delegations={delegated}
        rewards={rewards}
      />
      {openWith && (
        <BottomSheet
          onClose={onCloseBottomSheet}
          closeDistance={closeDistance}
          title={getText(I18N.stakingDelegateAccountTitle)}>
          {(isDelegate ? visible : available).map((item, id) => (
            <WalletRow
              key={id}
              item={item}
              onPress={isDelegate ? onDelegate : onUnDelegate}
            />
          ))}
          <Spacer height={50} />
        </BottomSheet>
      )}
    </>
  );
};
