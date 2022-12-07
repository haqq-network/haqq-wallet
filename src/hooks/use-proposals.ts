import {useEffect, useMemo, useState} from 'react';

import {GovernanceVoting} from '@app/models/governance-voting';
import {ProposalsTagKeys} from '@app/types';

export function useProposals() {
  const [allProposals, setAllProposals] =
    useState<Realm.Results<GovernanceVoting & Realm.Object<unknown, never>>>();
  const [statusFilter, setStatusFilter] = useState<ProposalsTagKeys>('all');

  useEffect(() => {
    const proposalsList = GovernanceVoting.getAll();
    setAllProposals(proposalsList);

    const onEvent = () => {
      setAllProposals(GovernanceVoting.getAll());
    };

    proposalsList.addListener(onEvent);
    return () => {
      proposalsList.removeListener(onEvent);
    };
  }, []);

  const proposals = useMemo(() => {
    if (statusFilter === 'all' || !allProposals || !statusFilter) {
      return allProposals;
    } else {
      return allProposals.filtered(`status == "${statusFilter}"`);
    }
  }, [allProposals, statusFilter]);

  return {proposals, setStatusFilter, statusFilter};
}
