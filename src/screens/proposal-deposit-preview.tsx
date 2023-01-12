import React, {useCallback, useEffect, useState} from 'react';

import {ProposalDepositPreview} from '@app/components/proposal-deposit-preview';
import {app} from '@app/contexts';
import {
  abortProviderInstanceForWallet,
  getProviderInstanceForWallet,
} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {Cosmos} from '@app/services/cosmos';

export const ProposalDepositPreviewScreen = () => {
  const navigation = useTypedNavigation();
  const {fee, account, amount, title, proposalId} =
    useTypedRoute<'proposalDepositPreview'>().params;

  const wallet = useWallet(account);

  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const onDone = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);

        const cosmos = new Cosmos(app.provider!);

        const resp = await cosmos.deposit(
          getProviderInstanceForWallet(wallet),
          proposalId,
          amount,
        );

        if (resp) {
          navigation.navigate('proposalDepositFinish', {
            txhash: resp.tx_response.txhash,
            title,
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
  }, [wallet, amount, fee, navigation, proposalId, title]);

  useEffect(() => {
    return () => {
      wallet && wallet.isValid() && abortProviderInstanceForWallet(wallet);
    };
  }, [wallet]);

  return (
    <ProposalDepositPreview
      title={title}
      amount={amount}
      fee={fee}
      disabled={disabled}
      onSend={onDone}
      error={error}
    />
  );
};
