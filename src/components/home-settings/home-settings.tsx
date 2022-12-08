import React from 'react';

import {IS_DEVELOPMENT} from '@env';
import {ScrollView} from 'react-native';

import {createTheme} from '@app/helpers';
import {useUser} from '@app/hooks';
import {I18N} from '@app/i18n';
import {capitalize} from '@app/utils';

import {SettingsButton} from './settings-button';

export const HomeSettings = () => {
  const {theme} = useUser();
  const capitalizedTheme = capitalize(theme);

  return (
    <ScrollView contentContainerStyle={page.container}>
      <SettingsButton
        icon="wallet"
        title={I18N.homeSettingsAccounts}
        next="settingsAccounts"
      />

      <SettingsButton
        icon="address_book"
        title={I18N.homeSettingsAddressBook}
        next="settingsAddressBook"
      />

      {/* <SettingsButton
        icon="language"
        rightTitle="EN"
        title={getText(I18N.homeSettingsLanguage)}
        next="settingsLanguage"
      /> */}

      {IS_DEVELOPMENT === '1' && (
        <SettingsButton
          rightTitle={capitalizedTheme}
          icon="brush"
          title={I18N.homeSettingsAppearance}
          next="settingsTheme"
        />
      )}

      <SettingsButton
        icon="shield"
        title={I18N.homeSettingsSecurity}
        next="settingsSecurity"
      />

      <SettingsButton
        icon="providers"
        title={I18N.homeSettingsProviders}
        next="settingsProviders"
        style={page.button}
      />

      {/*<SettingsButton*/}
      {/*  icon={<HelpSettingsIcon color={GRAPHIC_BASE_1} />}*/}
      {/*  title={getText(I18N.homeSettingsFAQ)}*/}
      {/*  onPress={onClickButton}*/}
      {/*  next="settingsFaq"*/}
      {/*/>*/}

      <SettingsButton
        icon="islm"
        title={I18N.homeSettingsAbout}
        next="settingsAbout"
        style={page.button}
      />

      {IS_DEVELOPMENT === '1' && (
        <SettingsButton
          icon="settings"
          title={I18N.homeSettingsTest}
          next="settingsTest"
          style={page.button}
        />
      )}
    </ScrollView>
  );
};

const page = createTheme({
  container: {
    marginHorizontal: 20,
  },
  button: {
    marginBottom: 20,
  },
});
