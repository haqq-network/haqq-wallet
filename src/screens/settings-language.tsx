import React, {useState} from 'react';
import {Container} from '../components/container';
import {useApp} from '../contexts/app';
import {CheckIcon, DataContent, IconButton} from '../components/ui';
import {Language} from '../models/user';
import {GRAPHIC_GREEN_1} from '../variables';
import {StyleSheet} from 'react-native';

export const SettingsLanguageScreen = () => {
  const app = useApp();
  const [language, setLanguage] = useState(app.language);

  const updateLanguage = (lang: Language) => {
    app.language = lang;
    setLanguage(app.language);
  };

  return (
    <Container>
      <IconButton
        style={page.button}
        onPress={() => {
          updateLanguage(Language.ar);
        }}>
        <DataContent title="Arabic" subtitle="العربية" />
        {language === Language.ar && (
          <CheckIcon color={GRAPHIC_GREEN_1} style={page.icon} />
        )}
      </IconButton>
      <IconButton
        style={page.button}
        onPress={() => {
          updateLanguage(Language.en);
        }}>
        <DataContent title="English" subtitle="English" />
        {language === Language.en && (
          <CheckIcon color={GRAPHIC_GREEN_1} style={page.icon} />
        )}
      </IconButton>
    </Container>
  );
};

const page = StyleSheet.create({
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
