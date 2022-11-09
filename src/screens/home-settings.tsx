import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';

import {Icon} from '../components/ui';
import {SettingsButton} from '../components/settings-button';
import {GRAPHIC_BASE_1, HR_GRAY} from '../variables';

export const HomeSettingsScreen = () => {
  return (
    <ScrollView contentContainerStyle={page.container}>
      <SettingsButton
        icon={<Icon s name="wallet" color={GRAPHIC_BASE_1} />}
        title="Manage accounts"
        next="settingsAccounts"
      />

      <SettingsButton
        icon={<Icon s name="addressBook" color={GRAPHIC_BASE_1} />}
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
        icon={<Icon s name="shield" color={GRAPHIC_BASE_1} />}
        title="Security"
        next="settingsSecurity"
      />

      <SettingsButton
        icon={<Icon s name="providers" color={GRAPHIC_BASE_1} />}
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
        icon={<Icon s name="islm" color={GRAPHIC_BASE_1} />}
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
