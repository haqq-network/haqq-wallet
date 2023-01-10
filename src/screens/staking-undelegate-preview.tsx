import React, {useCallback, useEffect, useState} from 'react';

import {StakingUnDelegatePreview} from '@app/components/staking-undelegate-preview';
import {awaitForLedger} from '@app/helpers/await-for-ledger';
import {
  useCosmos,
  useTypedNavigation,
  useTypedRoute,
  useWallet,
} from '@app/hooks';
import {WalletType} from '@app/types';

export const StakingUnDelegatePreviewScreen = () => {
  const navigation = useTypedNavigation();
  const {account, amount, validator, fee} =
    useTypedRoute<'stakingDelegatePreview'>().params;
  const [unboundingTime, setUnboundingTime] = useState(604800000);

  const cosmos = useCosmos();
  const wallet = useWallet(account);

  useEffect(() => {
    cosmos.getStakingParams().then(resp => {
      const regex = /(\d+)s/gm;
      const m = regex.exec(resp.params.unbonding_time);
      if (m) {
        setUnboundingTime(parseInt(m[1], 10) * 1000);
      }
    });
  }, [cosmos]);

  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const onDone = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);

        const transport = wallet.transport;

        const query = cosmos.unDelegate(
          transport,
          validator.operator_address,
          amount,
        );

        if (wallet.type === WalletType.ledgerBt) {
          await awaitForLedger(transport);
        }

        const resp = await query;

        if (resp) {
          navigation.navigate('stakingUnDelegateFinish', {
            txhash: resp.tx_response.txhash,
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
  }, [wallet, cosmos, validator, amount, navigation, fee]);

  useEffect(() => {
    return () => {
      wallet?.transportExists && wallet?.transport.abort();
    };
  }, [wallet]);

  return (
    <StakingUnDelegatePreview
      unboundingTime={unboundingTime}
      amount={amount}
      fee={fee}
      validator={validator}
      disabled={disabled}
      onSend={onDone}
      error={error}
    />
  );
};
