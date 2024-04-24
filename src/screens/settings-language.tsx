import React, {useCallback, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {Alert, I18nManager} from 'react-native';

import {SettingsLanguage} from '@app/components/settings-language';
import {app} from '@app/contexts';
import {I18N, getText, setLanguage} from '@app/i18n';
import {AppLanguage} from '@app/types';
import {RTL_LANGUAGES} from '@app/variables/common';

export const SettingsLanguageScreen = () => {
  const navigation = useNavigation();

  // Language field for local screen state
  const [language, updateLanguage] = useState(app.language);

  const shouldRestart = useCallback((lang: AppLanguage) => {
    const isAppInRTL = I18nManager.isRTL;
    const isLangRTL = RTL_LANGUAGES.includes(lang);
    return isAppInRTL !== isLangRTL;
  }, []);

  const onUpdateLanguage = (lang: AppLanguage) => {
    const restartNeeded = shouldRestart(lang);
    const action = () => {
      app.language = lang;
      setLanguage(lang);

      // Update local state
      updateLanguage(lang);
    };

    if (!restartNeeded) {
      return action();
    }

    Alert.alert(
      getText(I18N.localeChangeModalTitle),
      getText(I18N.localeChangeModalDescription),
      [
        {
          text: getText(I18N.localeChangeModalDecline),
        },
        {
          style: 'cancel',
          text: getText(I18N.localeChangeModalAccept),
          onPress: action,
        },
      ],
    );
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
