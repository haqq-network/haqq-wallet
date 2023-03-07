import React, {useCallback, useEffect, useState} from 'react';

import {StakingUnDelegatePreview} from '@app/components/staking-undelegate-preview';
import {captureException, showModal} from '@app/helpers';
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
import {I18N, getText} from '@app/i18n';
import {WalletType} from '@app/types';
import {makeID} from '@app/utils';

export const StakingUnDelegatePreviewScreen = () => {
  const navigation = useTypedNavigation();
  const {account, amount, validator, fee} =
    useTypedRoute<'stakingDelegatePreview'>().params;
  const [unboundingTime, setUnboundingTime] = useState(604800000);
  const [error, setError] = useState('');
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

  const [disabled, setDisabled] = useState(false);

  const onDone = useCallback(async () => {
    if (wallet && wallet.isValid()) {
      let errMessage = '';
      try {
        setDisabled(true);

        if (wallet.type === WalletType.ledgerBt) {
          await awaitForBluetooth();
        }

        const transport = await getProviderInstanceForWallet(wallet);

        const query = cosmos.unDelegate(
          transport,
          wallet.path!,
          validator.operator_address,
          amount,
        );

        if (wallet.type === WalletType.ledgerBt) {
          await awaitForLedger(transport);
        }

        const resp = await query;

        if (!resp) {
          throw new Error('transaction_error');
        }

        if (resp.tx_response.code !== 0 || !resp.tx_response.txhash) {
          errMessage = resp.tx_response.raw_log ?? '';
          throw new Error('transaction_error');
        }

        navigation.navigate('stakingUnDelegateFinish', {
          txhash: resp.tx_response.txhash,
          validator: validator,
          amount: amount,
          fee: fee,
        });
      } catch (e) {
        if (e instanceof Error) {
          const errorId = makeID(4);

          switch (e.message) {
            case 'can_not_connected':
            case 'ledger_locked':
              showModal('ledger-locked');
              break;
            default:
              captureException(e, 'staking-undelegate', {
                id: errorId,
                message: errMessage || e.message,
              });

              setError(
                getText(I18N.transactionFailed, {
                  id: errorId,
                }),
              );
          }
        }
      } finally {
        setDisabled(false);
      }
    }
  }, [wallet, cosmos, validator, amount, navigation, fee]);

  useEffect(() => {
    return () => {
      wallet && wallet.isValid() && abortProviderInstanceForWallet(wallet);
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
