import React, {useState} from 'react';

import {SettingsLanguage} from '@app/components/settings-language';
import {useApp} from '@app/hooks';
import {AppLanguage} from '@app/types';

export const SettingsLanguageScreen = () => {
  const app = useApp();
  const [language, setLanguage] = useState(app.language);

  const onUpdatelanguage = (lang: AppLanguage) => {
    app.language = lang;
    setLanguage(app.language);
  };

  return (
    <SettingsLanguage language={language} onUpdatelanguage={onUpdatelanguage} />
  );
};
