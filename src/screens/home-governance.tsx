import React, {useEffect, useState} from 'react';

import {HomeGovernance} from '@app/components/home-governance';
import {useCosmos, useProposals, useTypedNavigation} from '@app/hooks';
import {ProposalsTagType} from '@app/variables/proposal';

export const HomeGovernanceScreen = () => {
  const {navigate} = useTypedNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const cosmos = useCosmos();

  useEffect(() => {
    cosmos.syncGovernanceVoting().finally(() => setLoading(false));
  }, [cosmos]);

  const onPressCard = (id: number) => {
    navigate('proposal', {id});
  };

  const onRefresh = () => {
    setRefreshing(true);
    cosmos.syncGovernanceVoting().finally(() => setRefreshing(false));
  };

  const {proposals, setStatusFilter, statusFilter} = useProposals();

  const onSelect = (tag: ProposalsTagType) => () => {
    setStatusFilter(tag[0]);
  };

  return (
    <HomeGovernance
      onSelect={onSelect}
      proposals={proposals}
      statusFilter={statusFilter}
      onRefresh={onRefresh}
      refreshing={refreshing}
      loading={loading}
      onPressCard={onPressCard}
    />
  );
};
