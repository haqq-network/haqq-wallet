import React, {memo, useCallback, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {Alert, I18nManager} from 'react-native';

import {SettingsLanguage} from '@app/components/settings-language';
import {app} from '@app/contexts';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N, getText, setLanguage} from '@app/i18n';
import {Backend} from '@app/services/backend';
import {AppLanguage, Language, LanguagesResponse} from '@app/types';
import {RTL_LANGUAGES} from '@app/variables/common';

export const SettingsLanguageScreen = memo(() => {
  const navigation = useNavigation();

  // Language field for local screen state
  const [language, updateLanguage] = useState(app.language);

  // Fetched languages
  const [languages, setLanguages] = useState<LanguagesResponse>([]);

  useEffectAsync(async () => {
    const data = await Backend.instance.languages();
    setLanguages(data);
  }, []);

  const shouldRestart = useCallback((lang: AppLanguage) => {
    const isAppInRTL = I18nManager.isRTL;
    const isLangRTL = RTL_LANGUAGES.includes(lang);
    return isAppInRTL !== isLangRTL;
  }, []);

  const onUpdateLanguage = async (lang: Language) => {
    const restartNeeded = shouldRestart(lang.id);
    const action = () => {
      app.language = lang.id;
      setLanguage(lang.id);

      // Update local state
      updateLanguage(lang.id);
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
      languages={languages}
    />
  );
});
