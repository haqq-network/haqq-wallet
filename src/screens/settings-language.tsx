import React, {useCallback, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {observer} from 'mobx-react';
import {Alert, I18nManager} from 'react-native';

import {SettingsLanguage} from '@app/components/settings-language';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N, getText} from '@app/i18n';
import {Language} from '@app/models/language';
import {Backend} from '@app/services/backend';
import {
  AppLanguage,
  Language as LanguageType,
  LanguagesResponse,
} from '@app/types';
import {RTL_LANGUAGES} from '@app/variables/common';

export const SettingsLanguageScreen = observer(() => {
  const navigation = useNavigation();

  // Language field for local screen state
  const [language, updateLanguage] = useState(Language.current);

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

  const onUpdateLanguage = async (lang: LanguageType) => {
    const restartNeeded = shouldRestart(lang.id);
    const action = async () => {
      await Language.update(lang);

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
