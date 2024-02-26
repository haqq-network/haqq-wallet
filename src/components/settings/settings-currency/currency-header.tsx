import React from 'react';

import {NativeStackHeaderProps} from '@react-navigation/native-stack';

import {CustomHeader} from '@app/components/ui';
import {I18N} from '@app/i18n';

export const CurrencyHeader = ({navigation}: NativeStackHeaderProps) => {
  return (
    <CustomHeader
      onPressLeft={navigation.goBack}
      iconLeft="arrow_back"
      title={I18N.settingsCurrencyScreen}
    />
  );
};
