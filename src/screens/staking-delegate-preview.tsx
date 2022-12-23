import React, {useCallback, useEffect, useState} from 'react';

import {StakingDelegatePreview} from '@app/components/staking-delegate-preview/staking-delegate-preview';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {Cosmos} from '@app/services/cosmos';

export const StakingDelegatePreviewScreen = () => {
  const navigation = useTypedNavigation();
  const {account, amount, validator, fee} =
    useTypedRoute<'stakingDelegatePreview'>().params;

  const wallet = useWallet(account);

  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const onDone = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);

        const cosmos = new Cosmos(app.provider!);

        const resp = await cosmos.delegate(
          wallet.transport,
          validator.operator_address,
          amount,
        );

        if (resp) {
          navigation.navigate('stakingDelegateFinish', {
            txhash: resp.tx_response.txhash,
            validator,
            amount,
            fee,
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        }
      } finally {
        setDisabled(false);
      }
    }
  }, [wallet, validator, amount, fee, navigation]);

  useEffect(() => {
    return () => {
      wallet?.transportExists && wallet?.transport.abort();
    };
  }, [wallet]);

  return (
    <StakingDelegatePreview
      amount={amount}
      fee={fee}
      validator={validator}
      disabled={disabled}
      onSend={onDone}
      error={error}
    />
  );
};
