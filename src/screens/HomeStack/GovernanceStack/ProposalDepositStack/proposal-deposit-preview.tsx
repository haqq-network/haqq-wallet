import React, {useCallback, useState} from 'react';

import {observer} from 'mobx-react';

import {ProposalDepositPreview} from '@app/components/proposal-deposit-preview';
import {getProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {
  ProposalDepositStackParamList,
  ProposalDepositStackRoutes,
} from '@app/route-types';
import {Cosmos} from '@app/services/cosmos';

export const ProposalDepositPreviewScreen = observer(() => {
  const navigation = useTypedNavigation<ProposalDepositStackParamList>();
  const {fee, account, amount, proposal} = useTypedRoute<
    ProposalDepositStackParamList,
    ProposalDepositStackRoutes.ProposalDepositPreview
  >().params;

  const wallet = Wallet.getById(account);

  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const onDone = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);

        const cosmos = new Cosmos(Provider.selectedProvider);
        const provider = await getProviderInstanceForWallet(wallet);
        const resp = await cosmos.deposit(
          provider,
          wallet.path!,
          proposal.proposal_id,
          amount,
        );

        if (resp) {
          navigation.navigate(
            ProposalDepositStackRoutes.ProposalDepositFinish,
            {
              txhash: resp.tx_response.txhash,
              proposal,
              amount,
              fee,
            },
          );
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        }
      } finally {
        setDisabled(false);
      }
    }
  }, [wallet, amount, fee, navigation, proposal]);

  return (
    <ProposalDepositPreview
      proposal={proposal}
      amount={amount}
      fee={fee}
      disabled={disabled}
      onSend={onDone}
      error={error}
    />
  );
});
