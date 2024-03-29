import React, {useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import RNRestart from 'react-native-restart';

import {SettingsLanguage} from '@app/components/settings-language';
import {app} from '@app/contexts';
import {AppLanguage} from '@app/types';
import {setRTL} from '@app/utils';

export const SettingsLanguageScreen = () => {
  const navigation = useNavigation();
  const [language, setLanguage] = useState(app.language);

  const onUpdateLanguage = (lang: AppLanguage) => {
    app.language = lang;
    setRTL(lang);
    setLanguage(lang);
    RNRestart.restart();
  };

  const goBack = () => navigation.goBack();

  return (
    <SettingsLanguage
      language={language}
      onUpdatelanguage={onUpdateLanguage}
      goBack={goBack}
    />
  );
};
