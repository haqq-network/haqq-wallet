import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Proposal} from '@evmos/provider/dist/rest/gov';

import {HomeGovernance} from '@app/components/home-governance';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {useCosmos, useTypedNavigation} from '@app/hooks';
import {AdjustEvents, ProposalsTagKeys} from '@app/types';
import {ProposalsTagType} from '@app/variables/proposal';

export const GovernanceListScreen = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const {navigate, goBack} = useTypedNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProposalsTagKeys>('*');
  const [searchText, setSearchText] = useState<string>('');

  const cosmos = useCosmos();

  const onGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

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

  useEffect(() => {
    onTrackEvent(AdjustEvents.governanceOpen);
  }, []);

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
        setRefreshing(false);
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
      onGoBack={onGoBack}
    />
  );
};
