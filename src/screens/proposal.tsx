import React, {useMemo} from 'react';

import {Proposal} from '@app/components/proposal';
import {app} from '@app/contexts';
import {useTypedRoute} from '@app/hooks';
import {
  GovernanceVoting,
  ProposalRealmType,
} from '@app/models/governance-voting';

export const ProposalScreen = () => {
  const {id} = useTypedRoute<'proposal'>().params;

  const item = useMemo(() => {
    return GovernanceVoting.getById(id) as ProposalRealmType;
  }, [id]);

  const onDepositSubmit = async (address: string) => {
    await item?.sendDeposit(address, 0.00000005);
    app.removeListener('wallet-selected-proposal-deposit', onDepositSubmit);
  };

  return <Proposal {...{onDepositSubmit, item}} />;
};
