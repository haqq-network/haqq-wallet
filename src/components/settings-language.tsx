import React from 'react';

import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {
  DataContent,
  Icon,
  IconButton,
  PopupContainer,
} from '@app/components/ui';
import {AppLanguage} from '@app/types';

type SettingsLanguageProps = {
  onUpdatelanguage: (lang: AppLanguage) => void;
  language: AppLanguage;
};

export const SettingsLanguage = ({
  onUpdatelanguage,
  language,
}: SettingsLanguageProps) => {
  return (
    <PopupContainer style={styles.container}>
      <IconButton
        style={styles.button}
        onPress={() => {
          onUpdatelanguage(AppLanguage.ar);
        }}>
        <DataContent title="Arabic" subtitle="العربية" />
        {language === AppLanguage.ar && (
          <Icon name="check" color={Color.graphicGreen1} i24 />
        )}
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => {
          onUpdatelanguage(AppLanguage.en);
        }}>
        <DataContent title="English" subtitle="English" />
        {language === AppLanguage.en && (
          <Icon name="check" color={Color.graphicGreen1} i24 />
        )}
      </IconButton>
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
  button: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
