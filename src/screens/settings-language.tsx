import React, {useState} from 'react';

import {SettingsLanguage} from '@app/components/settings-language';
import {app} from '@app/contexts';
import {AppLanguage} from '@app/types';

export const SettingsLanguageScreen = () => {
  const [language, setLanguage] = useState(app.language);

  const onUpdateLanguage = (lang: AppLanguage) => {
    app.language = lang;
    setLanguage(app.language);
  };

  return (
    <SettingsLanguage language={language} onUpdatelanguage={onUpdateLanguage} />
  );
};
