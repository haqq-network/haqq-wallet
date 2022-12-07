import {useEffect, useState} from 'react';

import {GovernanceVoting} from '@app/models/governance-voting';

export function useProposals() {
  const [proposals, setProposals] =
    useState<Realm.Results<GovernanceVoting & Realm.Object<unknown, never>>>();

  useEffect(() => {
    const proposalsList = GovernanceVoting.getAll();
    setProposals(proposalsList);

    const onEvent = () => {
      setProposals(GovernanceVoting.getAll());
    };

    proposalsList.addListener(onEvent);
    return () => {
      proposalsList.removeListener(onEvent);
    };
  }, []);
  return proposals;
}
