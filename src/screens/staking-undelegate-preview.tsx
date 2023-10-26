import React, {useCallback, useEffect, useState} from 'react';

import {observer} from 'mobx-react';

import {StakingUnDelegatePreview} from '@app/components/staking-undelegate-preview';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {
  abortProviderInstanceForWallet,
  getProviderInstanceForWallet,
} from '@app/helpers/provider-instance';
import {useCosmos, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useError} from '@app/hooks/use-error';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {makeID} from '@app/utils';

export const StakingUnDelegatePreviewScreen = observer(() => {
  const navigation = useTypedNavigation();
  const {account, amount, validator, fee} =
    useTypedRoute<'stakingDelegatePreview'>().params;
  const [unboundingTime, setUnboundingTime] = useState(604800000);
  const {error, errorDetails, setError} = useError();
  const cosmos = useCosmos();
  const wallet = Wallet.getById(account);

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
    if (wallet) {
      let errMessage = '';
      try {
        setDisabled(true);

        if (wallet.type === WalletType.ledgerBt) {
          await awaitForBluetooth();
        }

        const transport = await getProviderInstanceForWallet(wallet);

        const resp = await cosmos.unDelegate(
          transport,
          wallet.path!,
          validator.operator_address,
          amount,
        );

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
              break;
            default:
              Logger.captureException(e, 'staking-undelegate', {
                id: errorId,
                message: errMessage || e.message,
              });

              setError(errorId, errMessage || e.message);
          }
        }
      } finally {
        setDisabled(false);
      }
    }
  }, [wallet, cosmos, validator, amount, navigation, fee]);

  useEffect(() => {
    return () => {
      wallet && abortProviderInstanceForWallet(wallet);
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
      errorDetails={errorDetails}
    />
  );
});
