import React, {useCallback, useEffect, useState} from 'react';

import {StakingDelegatePreview} from '@app/components/staking-delegate-preview';
import {showModal} from '@app/helpers';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {awaitForLedger} from '@app/helpers/await-for-ledger';
import {
  abortProviderInstanceForWallet,
  getProviderInstanceForWallet,
} from '@app/helpers/provider-instance';
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
    if (wallet && wallet.isValid()) {
      let errMessage = '';
      try {
        setDisabled(true);

        if (wallet.type === WalletType.ledgerBt) {
          await awaitForBluetooth();
        }

        const transport = getProviderInstanceForWallet(wallet);

        const query = cosmos.delegate(
          transport,
          validator.operator_address,
          amount,
        );

        if (wallet.type === WalletType.ledgerBt) {
          await awaitForLedger(transport);
        }

        const resp = await query;

        console.log('resp', JSON.stringify(resp));

        if (!resp) {
          throw new Error('transaction_error');
        }

        if (resp.tx_response.code !== 0 || !resp.tx_response.txhash) {
          errMessage = resp.tx_response.raw_log ?? '';
          throw new Error('transaction_error');
        }

        navigation.navigate('stakingDelegateFinish', {
          txhash: resp.tx_response.txhash,
          validator,
          amount,
          fee,
        });
      } catch (e) {
        if (e instanceof Error) {
          switch (e.message) {
            case 'can_not_connected':
            case 'ledger_locked':
              showModal('ledger-locked');
              break;
            case 'transaction_error':
              showModal('transaction-error', {
                message: errMessage,
              });
              break;
            default:
              setError(e.message);
          }
        }
      } finally {
        setDisabled(false);
      }
    }
  }, [cosmos, wallet, validator, amount, fee, navigation]);

  useEffect(() => {
    return () => {
      wallet && wallet.isValid() && abortProviderInstanceForWallet(wallet);
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
