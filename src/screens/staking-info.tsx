import React, {useCallback, useEffect, useState} from 'react';

import {useWindowDimensions} from 'react-native';

import {StakingInfo} from '@app/components/staking-info';
import {app} from '@app/contexts';
import {awaitForPopupClosed, showModal} from '@app/helpers';
import {awaitForLedger} from '@app/helpers/await-for-ledger';
import {
  abortProviderInstanceForWallet,
  getProviderInstanceForWallet,
} from '@app/helpers/provider-instance';
import {useCosmos, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';

export const StakingInfoScreen = () => {
  const {validator} = useTypedRoute<'stakingInfo'>().params;
  const {operator_address} = validator;
  const navigation = useTypedNavigation();
  const [visible, setVisible] = useState(Wallet.getAllVisible().snapshot());
  const cosmos = useCosmos();

  const [withdrawDelegatorRewardProgress, setWithdrawDelegatorRewardProgress] =
    useState(false);

  const [rewards, setRewards] = useState<StakingMetadata[]>([]);
  const [delegated, setDelegated] = useState<StakingMetadata[]>([]);
  const [undelegated, setUndelegated] = useState<StakingMetadata[]>([]);

  const closeDistance = useWindowDimensions().height / 6;

  useEffect(() => {
    const wallets = Wallet.getAllVisible();
    const sub = () => {
      setVisible(wallets.snapshot());
    };

    wallets.addListener(sub);

    return () => {
      wallets.removeListener(sub);
    };
  }, []);

  useEffect(() => {
    const r = StakingMetadata.getAllByValidator(operator_address);

    const subscription = () => {
      const data = r.snapshot();

      setRewards(data.filter(row => row.type === StakingMetadataType.reward));
      setDelegated(
        data.filter(row => row.type === StakingMetadataType.delegation),
      );
      setUndelegated(
        data.filter(row => row.type === StakingMetadataType.undelegation),
      );
    };

    r.addListener(subscription);
    return () => {
      r.removeListener(subscription);
    };
  }, [operator_address]);

  useEffect(() => {
    return () => {
      visible.map(w => abortProviderInstanceForWallet(w));
    };
  }, [visible]);

  const onWithdrawDelegatorReward = useCallback(async () => {
    if (rewards?.length) {
      setWithdrawDelegatorRewardProgress(true);
      const delegators = new Set(rewards.map(r => r.delegator));
      const exists = visible.filter(w => delegators.has(w.cosmosAddress));

      const queue = exists
        .filter(w => w.type !== WalletType.ledgerBt)
        .map(w => {
          return cosmos
            .withdrawDelegatorReward(
              getProviderInstanceForWallet(w),
              operator_address,
            )
            .then(() => [w.cosmosAddress, operator_address]);
        });

      const ledger = exists.filter(w => w.type === WalletType.ledgerBt);

      while (ledger.length) {
        const current = ledger.shift();

        if (current) {
          const transport = getProviderInstanceForWallet(current);
          try {
            queue.push(
              cosmos
                .withdrawDelegatorReward(transport, operator_address)
                .then(() => [current.cosmosAddress, operator_address]),
            );

            await awaitForLedger(transport);
          } catch (e) {
            await awaitForPopupClosed('ledger-locked');
            transport.abort();
          }
        }
      }

      const responses = await Promise.all(
        queue.map(p =>
          p
            .then(value => ({
              status: 'fulfilled',
              value,
            }))
            .catch(reason => ({
              status: 'rejected',
              reason,
              value: null,
            })),
        ),
      );

      for (const resp of responses) {
        if (resp.status === 'fulfilled' && resp.value) {
          for (const reward of rewards) {
            if (
              reward &&
              reward.delegator === resp.value[0] &&
              reward.validator === resp.value[1]
            ) {
              StakingMetadata.remove(reward.hash);
            }
          }
        }
      }

      setWithdrawDelegatorRewardProgress(false);
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

  return (
    <StakingInfo
      withdrawDelegatorRewardProgress={withdrawDelegatorRewardProgress}
      validator={validator}
      onDelegate={onDelegate}
      onUnDelegate={onUnDelegate}
      onWithdrawDelegatorReward={onWithdrawDelegatorReward}
      unDelegations={undelegated}
      delegations={delegated}
      rewards={rewards}
    />
  );
};
