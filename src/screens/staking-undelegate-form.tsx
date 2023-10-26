import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';
import {observer} from 'mobx-react';

import {StakingUnDelegateForm} from '@app/components/staking-undelegate-form';
import {getProviderInstanceForWallet} from '@app/helpers';
import {useCosmos, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useLayoutEffectAsync} from '@app/hooks/use-effect-async';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';
import {FEE_ESTIMATING_TIMEOUT_MS} from '@app/variables/common';

export const StakingUnDelegateFormScreen = observer(() => {
  const navigation = useTypedNavigation();
  const {validator, account} = useTypedRoute<'stakingUnDelegateForm'>().params;
  const {operator_address} = validator;
  const cosmos = useCosmos();
  const wallet = Wallet.getById(account);
  const [unboundingTime, setUnboundingTime] = useState(604800000);
  const [fee, _setFee] = useState<Balance | null>(null);

  const setDefaultFee = useCallback(
    () => _setFee(new Balance(Cosmos.fee.amount)),
    [],
  );

  const setFee = useCallback(async (amount?: string) => {
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
      if (instance instanceof ProviderLedgerReactNative) {
        instance.abort();
        setDefaultFee();
      }
    }
  }, []);

  const balance = useMemo(() => {
    const delegations =
      StakingMetadata.getDelegationsForValidator(operator_address);

    const delegation = delegations.find(
      d => d.delegator === wallet?.cosmosAddress,
    );

    return new Balance(delegation?.amount ?? 0);
  }, [operator_address, wallet?.cosmosAddress]);

  useLayoutEffectAsync(async () => {
    const timer = setTimeout(() => setDefaultFee(), FEE_ESTIMATING_TIMEOUT_MS);

    await setFee();
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
      setFee={setFee}
      unboundingTime={unboundingTime}
    />
  );
});
