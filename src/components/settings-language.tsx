import React from 'react';

import {Color} from '@app/colors';
import {
  CustomHeader,
  DataContent,
  Icon,
  IconButton,
  PopupContainer,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {AppLanguage, Language} from '@app/types';

type SettingsLanguageProps = {
  onUpdatelanguage: (lang: Language) => void;
  language: AppLanguage;
  goBack: () => void;
  languages: Language[];
};

export const SettingsLanguage = ({
  onUpdatelanguage,
  language,
  goBack,
  languages,
}: SettingsLanguageProps) => {
  return (
    <>
      <CustomHeader
        onPressLeft={goBack}
        iconLeft="arrow_back"
        title={I18N.homeSettingsLanguage}
      />
      <PopupContainer style={styles.container}>
        {languages.map(item => {
          return (
            <IconButton
              key={item.id}
              style={styles.button}
              onPress={() => {
                onUpdatelanguage(item);
              }}>
              <DataContent title={item.title} subtitle={item.local_title} />
              {language === item.id && (
                <Icon name="check" color={Color.graphicGreen1} i24 />
              )}
            </IconButton>
          );
        })}
      </PopupContainer>
    </>
  );
};

const styles = createTheme({
  container: {
    marginHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
