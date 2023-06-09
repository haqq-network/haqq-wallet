import {useEffect, useMemo, useRef, useState} from 'react';

import {
  GovernanceVoting,
  ProposalRealmSubType,
  ProposalsRealmType,
} from '@app/models/governance-voting';
import {ProposalsCroppedList, ProposalsTagKeys} from '@app/types';

function prepareProposals(list: ProposalsRealmType) {
  return list.map(({status, orderNumber, title}) => ({
    status,
    id: orderNumber,
    title,
  }));
}

export function useProposals() {
  const [allProposals, setAllProposals] = useState<ProposalsCroppedList>([]);
  const [statusFilter, setStatusFilter] = useState<ProposalsTagKeys>('*');
  const [searchText, setSearchText] = useState<string>('');

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
    if (statusFilter === '*' || !statusFilter) {
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

  return {
    proposals: proposals.filter(a =>
      a.title.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
    ),
    setSearchText,
    setStatusFilter,
    statusFilter,
  };
}
