import React, {useMemo} from 'react';

import {Proposal} from '@app/components/proposal';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {GovernanceVoting} from '@app/models/governance-voting';

export const ProposalScreen = () => {
  const {id} = useTypedRoute<'proposal'>().params;
  const {navigate} = useTypedNavigation();

  const item = useMemo(() => {
    return GovernanceVoting.getById(id);
  }, [id]);

  const onDepositSubmit = async (address: string) => {
    navigate('proposalDeposit', {
      account: address,
      proposalId: id,
    });
    app.removeListener('wallet-selected-proposal-deposit', onDepositSubmit);
  };

  if (!item) {
    return <></>;
  }

  return <Proposal onDepositSubmit={onDepositSubmit} item={item} />;
};
