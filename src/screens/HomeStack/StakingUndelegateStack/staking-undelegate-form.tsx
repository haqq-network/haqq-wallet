import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {StakingUnDelegateForm} from '@app/components/staking-undelegate-form';
import {
  useCosmos,
  useTypedNavigation,
  useTypedRoute,
  useWallet,
} from '@app/hooks';
import {StakingMetadata} from '@app/models/staking-metadata';
import {
  StakingUnDelegateStackParamList,
  StakingUnDelegateStackRoutes,
} from '@app/screens/HomeStack/StakingUndelegateStack';
import {Cosmos} from '@app/services/cosmos';

export const StakingUnDelegateFormScreen = memo(() => {
  const navigation = useTypedNavigation<StakingUnDelegateStackParamList>();
  const {validator, account} = useTypedRoute<
    StakingUnDelegateStackParamList,
    StakingUnDelegateStackRoutes.StakingUnDelegateForm
  >().params;
  const {operator_address} = validator;
  const cosmos = useCosmos();
  const wallet = useWallet(account);
  const [unboundingTime, setUnboundingTime] = useState(604800000);

  useEffect(() => {
    cosmos.getStakingParams().then(resp => {
      const regex = /(\d+)s/gm;
      const m = regex.exec(resp.params.unbonding_time);
      if (m) {
        setUnboundingTime(parseInt(m[1], 10) * 1000);
      }
    });
  }, [cosmos]);

  const balance = useMemo(() => {
    const delegations =
      StakingMetadata.getDelegationsForValidator(operator_address);

    const delegation = delegations.find(
      d => d.delegator === wallet?.cosmosAddress,
    );

    return delegation?.amount ?? 0;
  }, [operator_address, wallet?.cosmosAddress]);

  const fee = parseInt(Cosmos.fee.amount, 10);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate(
        StakingUnDelegateStackRoutes.StakingUnDelegatePreview,
        {
          validator: validator,
          account: account,
          amount,
          fee,
        },
      );
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
});
