import {useEffect, useMemo, useRef, useState} from 'react';

import {
  GovernanceVoting,
  ProposalRealmSubType,
  ProposalsRealmType,
} from '@app/models/governance-voting';
import {ProposalsTagKeys} from '@app/types';

type proposalsPart = {
  id: number;
  status: string;
}[];

function prepareProposals(list: ProposalsRealmType) {
  return list.map(({status, orderNumber}) => ({
    status,
    id: orderNumber,
  }));
}

export function useProposals() {
  const [allProposals, setAllProposals] = useState<proposalsPart>([]);
  const [statusFilter, setStatusFilter] = useState<ProposalsTagKeys>('all');

  const proposalsRef = useRef<ProposalsRealmType>();

  useEffect(() => {
    proposalsRef.current = GovernanceVoting.getAll();
    const proposals = prepareProposals(proposalsRef.current);

    setAllProposals(proposals);

    const onEvent: ProposalRealmSubType = data => {
      const newData = prepareProposals(data.snapshot());
      setAllProposals(newData);
    };

    proposalsRef.current.addListener(onEvent);
    return () => {
      proposalsRef.current?.removeListener(onEvent);
    };
  }, []);

  const proposals = useMemo(() => {
    if (statusFilter === 'all' || !statusFilter) {
      return allProposals;
    } else {
      const filtered = proposalsRef.current?.filtered(
        `status == "${statusFilter}"`,
      );
      if (filtered) {
        return prepareProposals(filtered);
      } else {
        return allProposals;
      }
    }
  }, [statusFilter, allProposals]);

  return {proposals, setStatusFilter, statusFilter};
}
