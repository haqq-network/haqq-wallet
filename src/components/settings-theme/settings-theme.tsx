import React from 'react';

import {Color, getColor} from '../../colors';
import {createTheme} from '../../helpers/create-theme';
import {I18N, getText} from '../../i18n';
import {AppTheme} from '../../types';
import {CheckIcon, DataContent, IconButton, PopupContainer} from '../ui';

export type SettingsThemeProps = {
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
};

export const SettingsTheme = ({theme, onChangeTheme}: SettingsThemeProps) => {
  return (
    <PopupContainer style={styles.container}>
      <IconButton
        style={styles.button}
        onPress={() => {
          onChangeTheme(AppTheme.light);
        }}>
        <DataContent title={getText(I18N.settingsThemeLight)} />
        {theme === AppTheme.light && (
          <CheckIcon
            color={getColor(Color.graphicGreen1)}
            style={styles.icon}
          />
        )}
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => {
          onChangeTheme(AppTheme.dark);
        }}>
        <DataContent title={getText(I18N.settingsThemeDark)} />
        {theme === AppTheme.dark && (
          <CheckIcon
            color={getColor(Color.graphicGreen1)}
            style={styles.icon}
          />
        )}
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => {
          onChangeTheme(AppTheme.system);
        }}>
        <DataContent title={getText(I18N.settingsThemeSystem)} />
        {theme === AppTheme.system && (
          <CheckIcon
            color={getColor(Color.graphicGreen1)}
            style={styles.icon}
          />
        )}
      </IconButton>
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    marginHorizontal: 20,
  },
  button: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    width: 24,
    height: 24,
  },
});
