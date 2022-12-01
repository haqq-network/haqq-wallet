import React, {useMemo} from 'react';

import {RouteProp} from '@react-navigation/core/lib/typescript/src/types';

import {Text} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';
import {RootStackParamList} from '@app/types';

export type HomeScreenTitleProps = {
  route: RouteProp<RootStackParamList>;
};

export const HomeScreenTitle = ({route}: HomeScreenTitleProps) => {
  const name = useMemo(() => {
    switch (route.name) {
      case 'homeFeed':
        return getText(I18N.homeWalletTitle);
      case 'homeStaking':
        return getText(I18N.homeStakingTitle);
      case 'homeGovernance':
        return getText(I18N.homeGovernanceTitle);
      case 'homeSettings':
        return getText(I18N.homeSettingsTitle);
    }
  }, [route.name]);

  return <Text t8>{name}</Text>;
};
