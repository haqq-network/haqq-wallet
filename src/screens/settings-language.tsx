import React, {useState} from 'react';
import {
  CheckIcon,
  DataContent,
  IconButton,
  PopupContainer,
} from '../components/ui';
import {useApp} from '../contexts/app';
import {LIGHT_GRAPHIC_GREEN_1} from '../variables';
import {StyleSheet} from 'react-native';
import {AppLanguage} from '../types';

export const SettingsLanguageScreen = () => {
  const app = useApp();
  const [language, setLanguage] = useState(app.language);

  const updateLanguage = (lang: AppLanguage) => {
    app.language = lang;
    setLanguage(app.language);
  };

  return (
    <PopupContainer style={page.container}>
      <IconButton
        style={page.button}
        onPress={() => {
          updateLanguage(AppLanguage.ar);
        }}>
        <DataContent title="Arabic" subtitle="العربية" />
        {language === AppLanguage.ar && (
          <CheckIcon color={LIGHT_GRAPHIC_GREEN_1} style={page.icon} />
        )}
      </IconButton>
      <IconButton
        style={page.button}
        onPress={() => {
          updateLanguage(AppLanguage.en);
        }}>
        <DataContent title="English" subtitle="English" />
        {language === AppLanguage.en && (
          <CheckIcon color={LIGHT_GRAPHIC_GREEN_1} style={page.icon} />
        )}
      </IconButton>
    </PopupContainer>
  );
};

const page = StyleSheet.create({
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
