import React, {useMemo} from 'react';

import {RouteProp} from '@react-navigation/core/lib/typescript/src/types';

import {Color} from '@app/colors';
import {Icon, IconsName} from '@app/components/ui';
import {RootStackParamList} from '@app/types';

export type HomeScreenTabBarIconProps = {
  route: RouteProp<RootStackParamList>;
  focused: boolean;
};

export const HomeScreenTabBarIcon = ({
  focused,
  route,
}: HomeScreenTabBarIconProps) => {
  const name = useMemo(() => {
    switch (route.name) {
      case 'homeFeed':
        return IconsName.wallet;
      case 'homeStaking':
        return IconsName.staking;
      case 'homeSettings':
        return IconsName.settings;
      case 'homeGovernance':
        return IconsName.governance;
    }
  }, [route.name]);

  if (!name) {
    return null;
  }

  return (
    <Icon
      name={name}
      color={focused ? Color.graphicGreen1 : Color.graphicBase2}
    />
  );
};
