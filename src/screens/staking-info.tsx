import React, {useCallback, useEffect, useState} from 'react';

import {StakingInfo} from '@app/components/staking-info';
import {app} from '@app/contexts';
import {
  abortProviderInstanceForWallet,
  awaitForBluetooth,
  awaitForLedger,
  awaitForPopupClosed,
  awaitForWallet,
  getProviderInstanceForWallet,
} from '@app/helpers';
import {useCosmos, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {MIN_AMOUNT} from '@app/variables/common';

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
            await awaitForBluetooth();

            queue.push(
              cosmos
                .withdrawDelegatorReward(
                  transport,
                  current.path!,
                  operator_address,
                )
                .then(() => [current.cosmosAddress, operator_address]),
            );
            await awaitForLedger(transport);
          } catch (e) {
            if (e === '27010') {
              await awaitForPopupClosed('ledger-locked');
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

      setWithdrawDelegatorRewardProgress(false);
    }
  }, [cosmos, rewards, operator_address, visible]);

  const onDelegate = useCallback(async () => {
    const address = await awaitForWallet(
      visible.filter(v => app.getBalance(v.address) >= MIN_AMOUNT),
      I18N.stakingDelegateAccountTitle,
    );

    navigation.push('stakingDelegate', {
      validator: operator_address,
      selectedWalletAddress: address,
    });
  }, [navigation, operator_address, visible]);

  const onUnDelegate = useCallback(async () => {
    const delegations = new Set(
      StakingMetadata.getDelegationsForValidator(operator_address)
        .filter(v => v.amount >= MIN_AMOUNT)
        .map(v => v.delegator),
    );
    const available = visible.filter(w => delegations.has(w.cosmosAddress));

    const address = await awaitForWallet(
      available,
      I18N.stakingDelegateAccountTitle,
    );

    navigation.push('stakingUnDelegate', {
      validator: operator_address,
      selectedWalletAddress: address,
    });
  }, [navigation, operator_address, visible]);

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
