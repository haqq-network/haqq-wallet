import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {StakingUnDelegateForm} from '@app/components/staking-undelegate-form';
import {getProviderInstanceForWallet} from '@app/helpers';
import {
  useCosmos,
  useTypedNavigation,
  useTypedRoute,
  useWallet,
} from '@app/hooks';
import {useLayoutEffectAsync} from '@app/hooks/use-effect-async';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';
import {FEE_ESTIMATING_TIMEOUT_MS} from '@app/variables/common';

export const StakingUnDelegateFormScreen = () => {
  const navigation = useTypedNavigation();
  const {validator, account} = useTypedRoute<'stakingUnDelegateForm'>().params;
  const {operator_address} = validator;
  const cosmos = useCosmos();
  const wallet = useWallet(account);
  const [unboundingTime, setUnboundingTime] = useState(604800000);
  const [fee, setFee] = useState<Balance | null>(null);

  const balance = useMemo(() => {
    const delegations =
      StakingMetadata.getDelegationsForValidator(operator_address);

    const delegation = delegations.find(
      d => d.delegator === wallet?.cosmosAddress,
    );

    return new Balance(delegation?.amount ?? 0);
  }, [operator_address, wallet?.cosmosAddress]);

  useLayoutEffectAsync(async () => {
    const timer = setTimeout(
      () => setFee(new Balance(Cosmos.fee.amount)),
      FEE_ESTIMATING_TIMEOUT_MS,
    );

    const instance = await getProviderInstanceForWallet(wallet!);
    const f = await cosmos.simulateUndelegate(
      instance,
      wallet?.path!,
      validator.operator_address,
      balance,
    );
    Logger.log('f.amount', f.amount);
    clearTimeout(timer);
    setFee(new Balance(f.amount));

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    cosmos.getStakingParams().then(resp => {
      const regex = /(\d+)s/gm;
      const m = regex.exec(resp.params.unbonding_time);
      if (m) {
        setUnboundingTime(parseInt(m[1], 10) * 1000);
      }
    });
  }, [cosmos]);

  const onAmount = useCallback(
    (amount: number) => {
      if (fee !== null) {
        navigation.navigate('stakingUnDelegatePreview', {
          validator: validator,
          account: account,
          amount,
          fee,
        });
      }
    },
    [fee, navigation, account, validator],
  );

  return (
    <StakingUnDelegateForm
      balance={balance}
      onAmount={onAmount}
      fee={fee}
      unboundingTime={unboundingTime}
    />
  );
};
