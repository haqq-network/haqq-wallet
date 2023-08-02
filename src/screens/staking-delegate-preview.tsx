import React, {useCallback, useEffect, useState} from 'react';

import {StakingDelegatePreview} from '@app/components/staking-delegate-preview';
import {onTrackEvent} from '@app/event-actions/on-track-event';
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
import {I18N, getText} from '@app/i18n';
import {AdjustEvents, WalletType} from '@app/types';
import {makeID} from '@app/utils';

export const StakingDelegatePreviewScreen = () => {
  const navigation = useTypedNavigation();
  const {account, amount, validator, fee} =
    useTypedRoute<'stakingDelegatePreview'>().params;

  const wallet = useWallet(account);
  const cosmos = useCosmos();

  const [unboundingTime, setUnboundingTime] = useState(604800000);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState('');

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

        const transport = await getProviderInstanceForWallet(wallet);

        const query = cosmos.delegate(
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

        onTrackEvent(AdjustEvents.stakingDelegate, {
          operator_address: validator.operator_address,
        });

        navigation.navigate('stakingDelegateFinish', {
          txhash: resp.tx_response.txhash,
          validator,
          amount,
          fee,
        });
      } catch (e) {
        if (e instanceof Error) {
          const errorId = makeID(4);

          switch (e.message) {
            case 'can_not_connected':
            case 'ledger_locked':
              showModal('ledgerLocked');
              break;
            default:
              Logger.captureException(e, 'staking-delegate', {
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
