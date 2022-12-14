import React, {useCallback, useEffect, useState} from 'react';

import {StakingDelegatePreview} from '@app/components/staking-delegate-preview';
import {awaitForLedger} from '@app/helpers/await-for-ledger';
import {
  useCosmos,
  useTypedNavigation,
  useTypedRoute,
  useWallet,
} from '@app/hooks';
import {WalletType} from '@app/types';

export const StakingDelegatePreviewScreen = () => {
  const navigation = useTypedNavigation();
  const {account, amount, validator, fee} =
    useTypedRoute<'stakingDelegatePreview'>().params;

  const wallet = useWallet(account);
  const cosmos = useCosmos();

  const [unboundingTime, setUnboundingTime] = useState(604800000);
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    cosmos.getStakingParams().then(resp => {
      const regex = /(\d+)s/gm;
      const m = regex.exec(resp.params.unbonding_time);
      if (m) {
        setUnboundingTime(parseInt(m[1], 10) * 1000);
      }
    });
  }, [cosmos]);

  const onDone = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);

        const transport = wallet.transport;

        const query = cosmos.delegate(
          transport,
          validator.operator_address,
          amount,
        );

        if (wallet.type === WalletType.ledgerBt) {
          await awaitForLedger(transport);
        }

        const resp = await query;

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
  }, [cosmos, wallet, validator, amount, fee, navigation]);

  useEffect(() => {
    return () => {
      wallet?.transportExists && wallet?.transport.abort();
    };
  }, [wallet]);

  return (
    <StakingDelegatePreview
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
