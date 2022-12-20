import React, {useMemo} from 'react';

import {Proposal} from '@app/components/proposal';
import {app} from '@app/contexts';
import {useCosmos, useTypedRoute} from '@app/hooks';
import {GovernanceVoting} from '@app/models/governance-voting';

export const ProposalScreen = () => {
  const {id} = useTypedRoute<'proposal'>().params;
  const cosmos = useCosmos();

  const item = useMemo(() => {
    return GovernanceVoting.getById(id);
  }, [id]);

  const onDepositSubmit = async (address: string) => {
    cosmos.deposit(address, item?.orderNumber ?? 0, 0.00000005);
    app.removeListener('wallet-selected-proposal-deposit', onDepositSubmit);
  };

  if (!item) {
    return <></>;
  }

  return <Proposal onDepositSubmit={onDepositSubmit} item={item} />;
};
