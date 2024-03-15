import React, {useMemo} from 'react';

import {Text, TextPosition, TextVariant} from '@app/components/ui';
import {I18N} from '@app/i18n';

export type HomeScreenTitleProps = {
  route: string;
};

export const HomeScreenTitle = ({route}: HomeScreenTitleProps) => {
  const name = useMemo(() => {
    switch (route) {
      case 'homeFeed':
        return I18N.homeWalletTitle;
      case 'homeEarn':
        return I18N.homeEarnTitle;
      case 'homeStaking':
        return I18N.homeStakingTitle;
      case 'homeBrowser':
        return I18N.homeBrowserTitle;
      case 'homeGovernance':
        return I18N.homeGovernanceTitle;
      case 'homeSettings':
        return I18N.homeSettingsTitle;
      case 'homeNews':
        return I18N.homeNewsTitle;
    }
  }, [route]);

  if (!name) {
    return null;
  }

  return (
    <Text variant={TextVariant.t8} position={TextPosition.center} i18n={name} />
  );
};
