import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {StakingUnDelegateForm} from '@app/components/staking-undelegate-form';
import {getProviderInstanceForWallet} from '@app/helpers';
import {
  useCosmos,
  useTypedNavigation,
  useTypedRoute,
  useWallet,
} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';

export const StakingUnDelegateFormScreen = () => {
  const navigation = useTypedNavigation();
  const {validator, account} = useTypedRoute<'stakingUnDelegateForm'>().params;
  const {operator_address} = validator;
  const cosmos = useCosmos();
  const wallet = useWallet(account);
  const [unboundingTime, setUnboundingTime] = useState(604800000);
  const [fee, setFee] = useState(new Balance(Cosmos.fee.amount));

  const balance = useMemo(() => {
    const delegations =
      StakingMetadata.getDelegationsForValidator(operator_address);

    const delegation = delegations.find(
      d => d.delegator === wallet?.cosmosAddress,
    );

    return new Balance(delegation?.amount ?? 0);
  }, [operator_address, wallet?.cosmosAddress]);

  useEffectAsync(async () => {
    const instance = await getProviderInstanceForWallet(wallet!);
    const f = await cosmos.simulateUndelegate(
      instance,
      wallet?.path!,
      validator.operator_address,
      balance,
    );
    Logger.log('f.amount', f.amount);
    setFee(new Balance(f.amount));
  }, [cosmos, wallet, validator, balance]);

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
      navigation.navigate('stakingUnDelegatePreview', {
        validator: validator,
        account: account,
        amount,
        fee,
      });
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
