import React from 'react';

import {ScrollView, StyleSheet} from 'react-native';

import {SettingsButton} from '../components/settings-button';
import {Icon} from '../components/ui';
import {HR_GRAY, LIGHT_GRAPHIC_BASE_1} from '../variables';

export const HomeSettingsScreen = () => {
  return (
    <ScrollView contentContainerStyle={page.container}>
      <SettingsButton
        icon={<Icon s name="wallet" color={LIGHT_GRAPHIC_BASE_1} />}
        title="Manage accounts"
        next="settingsAccounts"
      />

      <SettingsButton
        icon={<Icon s name="address_book" color={LIGHT_GRAPHIC_BASE_1} />}
        title="Address book"
        next="settingsAddressBook"
      />

      {/*<SettingsButton*/}
      {/*  icon={<LanguageSettingsIcon color={GRAPHIC_BASE_1} />}*/}
      {/*  title="Language"*/}
      {/*  onPress={onClickButton}*/}
      {/*  next="settingsLanguage"*/}
      {/*/>*/}

      <SettingsButton
        icon={<Icon s name="shield" color={LIGHT_GRAPHIC_BASE_1} />}
        title="Security"
        next="settingsSecurity"
      />

      <SettingsButton
        icon={<Icon s name="providers" color={LIGHT_GRAPHIC_BASE_1} />}
        title="Providers"
        next="settingsProviders"
        style={[page.button, page.hr]}
      />

      {/*<SettingsButton*/}
      {/*  icon={<HelpSettingsIcon color={GRAPHIC_BASE_1} />}*/}
      {/*  title="FAQ"*/}
      {/*  onPress={onClickButton}*/}
      {/*  next="settingsFaq"*/}
      {/*/>*/}

      <SettingsButton
        icon={<Icon s name="islm" color={LIGHT_GRAPHIC_BASE_1} />}
        title="About"
        next="settingsAbout"
        style={page.button}
      />

      {/*<SettingsButton*/}
      {/*  icon={<ISLMSettingsIcon color={GRAPHIC_BASE_1} />}*/}
      {/*  title="Test"*/}
      {/*  next="settingsTest"*/}
      {/*/>*/}
    </ScrollView>
  );
};

const page = StyleSheet.create({
  container: {marginHorizontal: 20},
  button: {marginBottom: 20},
  hr: {
    borderColor: HR_GRAY,
    borderBottomWidth: 1,
  },
});
