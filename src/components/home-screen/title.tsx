import React, {useMemo} from 'react';

import {Text} from '@app/components/ui';
import {I18N} from '@app/i18n';

export type HomeScreenTitleProps = {
  route: string;
};

export const HomeScreenTitle = ({route}: HomeScreenTitleProps) => {
  const name = useMemo(() => {
    switch (route) {
      case 'homeFeed':
        return I18N.homeWalletTitle;
      case 'homeStaking':
        return I18N.homeStakingTitle;
      case 'homeBrowser':
        return I18N.homeBrowserTitle;
      case 'homeGovernance':
        return I18N.homeGovernanceTitle;
      case 'homeSettings':
        return I18N.homeSettingsTitle;
    }
  }, [route]);

  if (!name) {
    return null;
  }

  return <Text t8 i18n={name} />;
};
