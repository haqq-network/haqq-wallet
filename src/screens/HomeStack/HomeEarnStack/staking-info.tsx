import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {autorun} from 'mobx';
import {observer} from 'mobx-react';

import {StakingInfo} from '@app/components/staking-info';
import {app} from '@app/contexts';
import {
  abortProviderInstanceForWallet,
  awaitForPopupClosed,
  awaitForWallet,
  getProviderInstanceForWallet,
} from '@app/helpers';
import {getRemoteBalanceValue} from '@app/helpers/get-remote-value';
import {reduceAmounts} from '@app/helpers/staking';
import {useCosmos, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useMinAmount} from '@app/hooks/use-min-amount';
import {I18N} from '@app/i18n';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {HomeEarnStackParamList, HomeEarnStackRoutes} from '@app/route-types';
import {sendNotification} from '@app/services';
import {Balance} from '@app/services/balance';
import {ModalType, WalletType} from '@app/types';

export const StakingInfoScreen = observer(() => {
  const {validator} = useTypedRoute<
    HomeEarnStackParamList,
    HomeEarnStackRoutes.StakingInfo
  >().params;
  const {operator_address} = validator;
  const navigation = useTypedNavigation<HomeEarnStackParamList>();
  const visible = Wallet.getAllVisible();
  const cosmos = useCosmos();
  const minAmount = useMinAmount();

  const [withdrawDelegatorRewardProgress, setWithdrawDelegatorRewardProgress] =
    useState(false);

  const [rewards, setRewards] = useState<StakingMetadata[]>([]);
  const [delegated, setDelegated] = useState<StakingMetadata[]>([]);
  const [undelegated, setUndelegated] = useState<StakingMetadata[]>([]);

  const canGetRewards = useMemo(() => {
    if (!rewards?.length) {
      return false;
    }

    const totalRewards = reduceAmounts(rewards);
    return new Balance(totalRewards).compare(
      getRemoteBalanceValue('staking_reward_min_amount'),
      'gte',
    );
  }, [rewards]);

  useEffect(() => {
    const data = StakingMetadata.getAllByValidator(operator_address);

    const disposer = autorun(() => {
      setRewards(data.filter(row => row.type === StakingMetadataType.reward));
      setDelegated(
        data.filter(row => row.type === StakingMetadataType.delegation),
      );
      setUndelegated(
        data.filter(row => row.type === StakingMetadataType.undelegation),
      );
    });

    return () => {
      disposer();
    };
  }, [operator_address]);

  useEffect(() => {
    return () => {
      visible.map(w => abortProviderInstanceForWallet(w));
    };
  }, [visible]);

  const onPressGetReward = useCallback(async () => {
    if (canGetRewards) {
      setWithdrawDelegatorRewardProgress(true);
      const delegators = new Set(rewards.map(r => r.delegator));
      const exists = visible.filter(w => delegators.has(w.cosmosAddress));

      const queue = exists
        .filter(w => w.type !== WalletType.ledgerBt)
        .map(async w => {
          const provider = await getProviderInstanceForWallet(w);
          await cosmos.withdrawDelegatorReward(
            provider,
            w.path!,
            operator_address,
          );
          return [w.cosmosAddress, operator_address];
        });

      const ledger = exists.filter(w => w.type === WalletType.ledgerBt);

      while (ledger.length) {
        const current = ledger.shift();

        if (current) {
          const transport = await getProviderInstanceForWallet(current);

          try {
            // await awaitForBluetooth();

            queue.push(
              cosmos
                .withdrawDelegatorReward(
                  transport,
                  current.path!,
                  operator_address,
                )
                .then(() => [current.cosmosAddress, operator_address]),
            );
            // await awaitForLedger(transport);
          } catch (e) {
            if (e === '27010') {
              await awaitForPopupClosed(ModalType.ledgerLocked);
            }
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

      sendNotification(I18N.stakingInfoRewardIsReceived);
      setWithdrawDelegatorRewardProgress(false);
    }
  }, [canGetRewards, rewards, visible, cosmos, operator_address]);

  const onDelegate = useCallback(async () => {
    const available = visible.filter(
      v => app.getAvailableBalance(v.address).toFloat() >= minAmount.toFloat(),
    );

    if (!available?.length) {
      return sendNotification(I18N.stakingInfoDelegationNoAvailableWallets);
    }

    const address = await awaitForWallet({
      wallets: available,
      title: I18N.stakingDelegateAccountTitle,
    });

    navigation.push(HomeEarnStackRoutes.StakingDelegate, {
      validator: operator_address,
      selectedWalletAddress: address,
    });
  }, [navigation, operator_address, visible, minAmount]);

  const onUnDelegate = useCallback(async () => {
    const delegations = new Set(
      StakingMetadata.getAllByTypeForValidator(
        operator_address,
        StakingMetadataType.delegation,
      )
        .filter(v => v.amount >= minAmount.toFloat())
        .map(v => v.delegator),
    );
    const available = visible.filter(w => delegations.has(w.cosmosAddress));

    if (!available?.length) {
      return sendNotification(I18N.stakingInfoUnDelegationNoAvailableWallets);
    }

    const address = await awaitForWallet({
      wallets: available,
      title: I18N.stakingDelegateAccountTitle,
    });

    navigation.push(HomeEarnStackRoutes.StakingUnDelegate, {
      validator: operator_address,
      selectedWalletAddress: address,
    });
  }, [navigation, operator_address, visible, minAmount]);

  return (
    <StakingInfo
      withdrawDelegatorRewardProgress={withdrawDelegatorRewardProgress}
      rewards={rewards}
      validator={validator}
      delegations={delegated}
      unDelegations={undelegated}
      canGetRewards={canGetRewards}
      onDelegate={onDelegate}
      onUnDelegate={onUnDelegate}
      onPressGetReward={onPressGetReward}
    />
  );
});
