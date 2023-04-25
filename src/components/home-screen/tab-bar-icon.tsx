import React, {useMemo} from 'react';

import {Color} from '@app/colors';
import {Icon, IconsName} from '@app/components/ui';

export type HomeScreenTabBarIconProps = {
  route: string;
  focused: boolean;
};

export const HomeScreenTabBarIcon = ({
  focused,
  route,
}: HomeScreenTabBarIconProps) => {
  const name = useMemo(() => {
    switch (route) {
      case 'homeFeed':
        return IconsName.wallet;
      case 'homeStaking':
        return IconsName.staking;
      case 'homeBrowser':
        return IconsName.global;
      case 'homeSettings':
        return IconsName.settings;
      case 'homeGovernance':
        return IconsName.governance;
    }
  }, [route]);

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
