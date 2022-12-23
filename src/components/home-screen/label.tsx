import React, {useMemo} from 'react';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {I18N} from '@app/i18n';

export type HomeScreenLabelProps = {
  route: string;
  focused: boolean;
};

export const HomeScreenLabel = ({route, focused}: HomeScreenLabelProps) => {
  const name = useMemo(() => {
    switch (route) {
      case 'homeFeed':
        return I18N.homeWallet;
      case 'homeStaking':
        return I18N.homeStaking;
      case 'homeGovernance':
        return I18N.homeGovernance;
      case 'homeSettings':
        return I18N.homeSettings;
    }
  }, [route]);

  if (!name) {
    return null;
  }

  return (
    <Text
      t17
      center
      i18n={name}
      color={focused ? Color.textGreen1 : Color.textBase2}
    />
  );
};
