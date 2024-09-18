import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {ProviderLedgerEvm} from '@haqq/rn-wallet-providers';
import _ from 'lodash';
import {observer} from 'mobx-react';

import {StakingUnDelegateForm} from '@app/components/staking-undelegate-form';
import {getProviderInstanceForWallet} from '@app/helpers';
import {useCosmos, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useLayoutEffectAsync} from '@app/hooks/use-effect-async';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {
  StakingUnDelegateStackParamList,
  StakingUnDelegateStackRoutes,
} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';
import {FEE_ESTIMATING_TIMEOUT_MS} from '@app/variables/common';

export const StakingUnDelegateFormScreen = observer(() => {
  const navigation = useTypedNavigation<StakingUnDelegateStackParamList>();
  const {validator, account} = useTypedRoute<
    StakingUnDelegateStackParamList,
    StakingUnDelegateStackRoutes.StakingUnDelegateForm
  >().params;
  const {operator_address} = validator;
  const cosmos = useCosmos();
  const wallet = Wallet.getById(account);
  const [unboundingTime, setUnboundingTime] = useState(604800000);
  const [fee, _setFee] = useState<Balance | null | undefined>();

  const setDefaultFee = useCallback(
    () => _setFee(new Balance(Cosmos.fee.amount)),
    [],
  );

  const balance = useMemo(() => {
    const delegations = StakingMetadata.getAllByTypeForValidator(
      operator_address,
      StakingMetadataType.delegation,
    );

    const delegation = delegations.find(
      d => d.delegator === wallet?.cosmosAddress,
    );

    return delegation?.amount ? new Balance(delegation.amount) : Balance.Empty;
  }, [operator_address, wallet?.cosmosAddress]);

  const setFee = useCallback(
    _.debounce(async (amount?: string) => {
      const instance = await getProviderInstanceForWallet(wallet!, true);

      try {
        _setFee(null);
        const f = await cosmos.simulateUndelegate(
          instance,
          wallet?.path!,
          validator.operator_address,
          amount ? new Balance(amount) : balance,
        );
        Logger.log('f.amount', f.amount);
        _setFee(new Balance(f.amount));
      } catch (err) {
        if (instance instanceof ProviderLedgerEvm) {
          instance.abort();
          setDefaultFee();
        }
      }
    }, 500),
    [wallet?.path, validator.operator_address, balance, setDefaultFee],
  );

  useLayoutEffectAsync(async () => {
    const timer = setTimeout(() => setDefaultFee(), FEE_ESTIMATING_TIMEOUT_MS);

    clearTimeout(timer);

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
      if (fee) {
        navigation.navigate(
          StakingUnDelegateStackRoutes.StakingUnDelegatePreview,
          {
            validator: validator,
            account: account,
            amount,
            fee,
          },
        );
      }
    },
    [fee, navigation, account, validator],
  );

  return (
    <StakingUnDelegateForm
      balance={balance}
      onAmount={onAmount}
      fee={fee}
      setFee={setFee}
      unboundingTime={unboundingTime}
    />
  );
});
