import React, {useCallback, useMemo, useState} from 'react';

import {ProviderLedgerEvm} from '@haqq/rn-wallet-providers';
import _ from 'lodash';
import {observer} from 'mobx-react';

import {StakingDelegateForm} from '@app/components/staking-delegate-form';
import {getProviderInstanceForWallet} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useLayoutEffectAsync} from '@app/hooks/use-effect-async';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {
  StakingDelegateStackParamList,
  StakingDelegateStackRoutes,
} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';
import {FEE_ESTIMATING_TIMEOUT_MS} from '@app/variables/common';

export const StakingDelegateFormScreen = observer(() => {
  const navigation = useTypedNavigation<StakingDelegateStackParamList>();
  const {account, validator} = useTypedRoute<
    StakingDelegateStackParamList,
    StakingDelegateStackRoutes.StakingDelegateForm
  >().params;
  const wallet = Wallet.getById(account);
  const balances = Wallet.getBalancesByAddressList([wallet!]);
  const currentBalance = useMemo(
    () => balances[AddressUtils.toEth(account)],
    [balances, account],
  );
  const [fee, _setFee] = useState<Balance | null | undefined>();

  const setDefaultFee = useCallback(
    () => _setFee(new Balance(Cosmos.fee.amount)),
    [],
  );

  const setFee = useCallback(
    _.debounce(async (amount?: string) => {
      const cosmos = new Cosmos(Provider.selectedProvider);
      const instance = await getProviderInstanceForWallet(wallet!, true);

      try {
        _setFee(null);
        const f = await cosmos.simulateDelegate(
          instance,
          wallet!.getPath()!,
          validator.operator_address,
          amount ? new Balance(amount) : currentBalance.availableForStake,
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
    [
      wallet,
      validator.operator_address,
      currentBalance.availableForStake,
      setDefaultFee,
    ],
  );

  useLayoutEffectAsync(async () => {
    const timer = setTimeout(() => {
      setDefaultFee();
    }, FEE_ESTIMATING_TIMEOUT_MS);

    clearTimeout(timer);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const onAmount = useCallback(
    (amount: number) => {
      if (fee) {
        navigation.navigate(StakingDelegateStackRoutes.StakingDelegatePreview, {
          validator,
          account,
          amount: amount,
          fee: fee,
        });
      }
    },
    [fee, navigation, account, validator],
  );

  return (
    <StakingDelegateForm
      validator={validator}
      account={account}
      onAmount={onAmount}
      balance={currentBalance.availableForStake}
      fee={fee}
      setFee={setFee}
    />
  );
});
