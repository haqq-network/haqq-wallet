import React, {useCallback, useEffect, useState} from 'react';

import {StakingUnDelegatePreview} from '@app/components/staking-undelegate-preview';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {Cosmos} from '@app/services/cosmos';

export const StakingUnDelegatePreviewScreen = () => {
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

        const {tx_response} =
          (await cosmos.unDelegate(
            wallet.transport,
            validator.operator_address,
            amount,
          )) || {};

        if (tx_response?.txhash) {
          navigation.navigate('stakingUnDelegateFinish', {
            txhash: tx_response?.txhash,
            validator: validator,
            amount: amount,
            fee: fee,
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
    <StakingUnDelegatePreview
      amount={amount}
      fee={fee}
      validator={validator}
      disabled={disabled}
      onSend={onDone}
      error={error}
    />
  );
};
