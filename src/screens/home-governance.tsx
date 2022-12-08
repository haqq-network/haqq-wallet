import React from 'react';

import {HomeGovernance} from '@app/components/home-governance';
import {useTypedNavigation} from '@app/hooks';

export const HomeGovernanceScreen = () => {
  const {navigate} = useTypedNavigation();

  const onPressCard = (hash: string) => {
    navigate('proposal', {hash});
  };

  return <HomeGovernance onPressCard={onPressCard} />;
};
