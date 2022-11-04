import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import {
  AddressBookSettingsIcon,
  ISLMSettingsIcon,
  PopupContainer,
  ProviderIcon,
  ShieldSettingsIcon,
  WalletIcon,
} from '../components/ui';
import {SettingsButton} from '../components/settings-button';
import {GRAPHIC_BASE_1} from '../variables';

export const HomeSettingsScreen = () => {
  return (
    <ScrollView contentContainerStyle={page.container}>
      <SettingsButton
        icon={<WalletIcon color={GRAPHIC_BASE_1} />}
        title="Manage accounts"
        next="settingsAccounts"
      />

      <SettingsButton
        icon={<AddressBookSettingsIcon color={GRAPHIC_BASE_1} />}
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
        icon={<ShieldSettingsIcon color={GRAPHIC_BASE_1} />}
        title="Security"
        next="settingsSecurity"
      />

      <SettingsButton
        icon={<ProviderIcon color={GRAPHIC_BASE_1} />}
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
        icon={<ISLMSettingsIcon color={GRAPHIC_BASE_1} />}
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
    borderColor: '#cccccc',
    borderBottomWidth: 1,
  },
});
