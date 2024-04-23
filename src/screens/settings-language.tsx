import React, {useState} from 'react';

import {useNavigation} from '@react-navigation/native';

import {SettingsLanguage} from '@app/components/settings-language';
import {app} from '@app/contexts';
import {setLanguage} from '@app/i18n';
import {AppLanguage} from '@app/types';

export const SettingsLanguageScreen = () => {
  const navigation = useNavigation();

  // Language field for local screen state
  const [language, updateLanguage] = useState(app.language);

  const onUpdateLanguage = (lang: AppLanguage) => {
    app.language = lang;
    setLanguage(lang);

    // Update local state
    updateLanguage(lang);
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
