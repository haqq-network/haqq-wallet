import React from 'react';

import {Color} from '@app/colors';
import {
  DataContent,
  Icon,
  IconButton,
  PopupContainer,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AppLanguage} from '@app/types';

type SettingsLanguageProps = {
  updateLanguage: (lang: AppLanguage) => void;
  language: AppLanguage;
};

export const SettingsLanguage = ({
  updateLanguage,
  language,
}: SettingsLanguageProps) => {
  return (
    <PopupContainer style={styles.container}>
      <IconButton
        style={styles.button}
        onPress={() => {
          updateLanguage(AppLanguage.ar);
        }}>
        <DataContent title="Arabic" subtitle="العربية" />
        {language === AppLanguage.ar && (
          <Icon name="check" color={Color.graphicGreen1} i24 />
        )}
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => {
          updateLanguage(AppLanguage.en);
        }}>
        <DataContent title="English" subtitle="English" />
        {language === AppLanguage.en && (
          <Icon name="check" color={Color.graphicGreen1} i24 />
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
});
