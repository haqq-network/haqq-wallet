import React, {memo, useCallback} from 'react';

import {IGovernanceWidget} from '@app/types';
import {openWeb3Browser} from '@app/utils';
import {DEFAULT_GOVERNANCE_LINK} from '@app/variables/common';
import {GovernanceWidget} from '@app/widgets/governance-widget/governance-widget';

export const GovernanceWidgetWrapper = memo(({link}: IGovernanceWidget) => {
  const onPress = useCallback(() => {
    openWeb3Browser(link || DEFAULT_GOVERNANCE_LINK);
  }, [link]);
  return <GovernanceWidget onPress={onPress} />;
});
