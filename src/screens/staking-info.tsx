import React, {useCallback, useEffect, useRef, useState} from 'react';

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
  const {visible} = useWallets();
  const route = useTypedRoute<'stakingInfo'>();
  const navigation = useTypedNavigation();
  const [withdrawDelegatorRewardProgress, setWithdrawDelegatorRewardProgress] =
    useState(false);
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const [rewards, setRewards] = useState<Realm.Results<StakingMetadata> | null>(
    null,
  );

  const closeDistance = useWindowDimensions().height / 6;
  const [openWith, setOpenWith] = useState<string | false>(false);

  const onCloseBottomSheet = () => {
    setOpenWith(false);
  };

  useEffect(() => {
    const r = StakingMetadata.getRewardsForValidator(
      route.params.validator.operator_address,
    );

    const subscription = () => {
      setRewards(
        StakingMetadata.getRewardsForValidator(
          route.params.validator.operator_address,
        ),
      );
    };

    r.addListener(subscription);
    setRewards(r);
    return () => {
      r.removeListener(subscription);
    };
  }, [route.params.validator.operator_address]);

  const onWithdrawDelegatorReward = useCallback(() => {
    if (rewards?.length) {
      setWithdrawDelegatorRewardProgress(true);
      const delegators = new Set(rewards.map(r => r.delegator));

      Promise.all(
        visible
          .filter(w => delegators.has(w.cosmosAddress))
          .map(w =>
            cosmos.withdrawDelegatorReward(
              w.address,
              route.params.validator.operator_address,
            ),
          ),
      )
        .then((...resp) => {
          console.log(JSON.stringify(resp));
          rewards.forEach(r => StakingMetadata.remove(r.hash));
        })
        .finally(() => {
          setWithdrawDelegatorRewardProgress(false);
        });
    }
  }, [cosmos, rewards, route.params.validator.operator_address, visible]);

  const onDelegate = useCallback(
    (address?: string) => {
      if (visible.length > 1) {
        navigation.push('stakingDelegate', {
          validator: route.params.validator.operator_address,
          selectedWalletAddress: visible[0].address,
        });
      } else if (address) {
        navigation.push('stakingDelegate', {
          validator: route.params.validator.operator_address,
          selectedWalletAddress: address,
        });
      } else {
        setOpenWith('delegate');
      }
    },
    [navigation, route.params.validator.operator_address, visible],
  );

  const onUnDelegate = useCallback(
    (address?: string) => {
      const delegations = new Set(
        StakingMetadata.getDelegationsForValidator(
          route.params.validator.operator_address,
        ).map(v => v.delegator),
      );
      const available = visible.filter(w => delegations.has(w.cosmosAddress));

      if (available.length > 1) {
        setOpenWith('undelegate');
      } else if (address) {
        navigation.push('stakingUnDelegate', {
          validator: route.params.validator.operator_address,
          selectedWalletAddress: address,
        });
      } else {
        navigation.push('stakingUnDelegate', {
          validator: route.params.validator.operator_address,
          selectedWalletAddress: available[0].address,
        });
      }
    },

    [navigation, visible, route.params.validator.operator_address],
  );

  const delegated = StakingMetadata.getDelegationsForValidator(
    route.params.validator.operator_address,
  );

  return (
    <>
      <StakingInfo
        withdrawDelegatorRewardProgress={withdrawDelegatorRewardProgress}
        validator={route.params.validator}
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
          {visible.map((item, id) => (
            <WalletRow
              key={id}
              item={item}
              onPress={openWith === 'delegate' ? onDelegate : onUnDelegate}
            />
          ))}
          <Spacer height={50} />
        </BottomSheet>
      )}
    </>
  );
};
