import React from 'react';

import {CustomHeader, PopupContainer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type SettingsThemeProps = {
  goBack: () => void;
};

export const SettingsCurrency = ({goBack}: SettingsThemeProps) => {
  return (
    <PopupContainer style={styles.container}>
      <CustomHeader
        onPressLeft={goBack}
        iconLeft="arrow_back"
        title={I18N.settingsCurrencyScreen}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    marginHorizontal: 20,
  },
});
