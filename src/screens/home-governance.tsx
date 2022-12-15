import React, {useEffect, useState} from 'react';

import {HomeGovernance} from '@app/components/home-governance';
import {useCosmos, useTypedNavigation} from '@app/hooks';

export const HomeGovernanceScreen = () => {
  const {navigate} = useTypedNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const cosmos = useCosmos();

  useEffect(() => {
    cosmos.syncGovernanceVoting().finally(() => setLoading(false));
  }, [cosmos]);

  const onPressCard = (hash: string) => {
    navigate('proposal', {hash});
  };

  const onRefresh = () => {
    setRefreshing(true);
    cosmos.syncGovernanceVoting().finally(() => setRefreshing(false));
  };

  return (
    <HomeGovernance
      onRefresh={onRefresh}
      refreshing={refreshing}
      loading={loading}
      onPressCard={onPressCard}
    />
  );
};
