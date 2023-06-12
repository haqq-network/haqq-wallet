import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Proposal} from '@evmos/provider/dist/rest/gov';

import {HomeGovernance} from '@app/components/home-governance';
import {useCosmos, useTypedNavigation} from '@app/hooks';
import {ProposalsTagKeys} from '@app/types';
import {ProposalsTagType} from '@app/variables/proposal';

export const HomeGovernanceScreen = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const {navigate} = useTypedNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProposalsTagKeys>('*');
  const [searchText, setSearchText] = useState<string>('');

  const cosmos = useCosmos();

  useEffect(() => {
    cosmos
      .getProposals()
      .then(p => {
        setProposals(p.proposals);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cosmos]);

  const onPressCard = useCallback(
    (proposal: Proposal) => {
      navigate('proposal', {proposal});
    },
    [navigate],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cosmos
      .getProposals()
      .then(p => {
        setProposals(p.proposals);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cosmos]);

  const onSelect = useCallback(
    (tag: ProposalsTagType) => () => {
      setStatusFilter(tag[0]);
    },
    [],
  );

  const onSearchChange = (text: string) => setSearchText(text);

  const rows = useMemo(() => {
    if (statusFilter === '*') {
      return proposals.filter(p => p.content.title.includes(searchText));
    } else {
      return proposals
        .filter(p => p.status === statusFilter)
        .filter(p => p.content.title.includes(searchText));
    }
  }, [proposals, statusFilter, searchText]);

  return (
    <HomeGovernance
      onSelect={onSelect}
      onSearchChange={onSearchChange}
      proposals={rows}
      statusFilter={statusFilter}
      onRefresh={onRefresh}
      refreshing={refreshing}
      loading={loading}
      onPressCard={onPressCard}
    />
  );
};
