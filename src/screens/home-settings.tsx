import React from 'react';
import {StyleSheet} from 'react-native';

import {
  AddressBookSettingsIcon,
  Container,
  ISLMSettingsIcon,
  ProviderIcon,
  ShieldSettingsIcon,
  Spacer,
  Text,
  WalletIcon,
} from '../components/ui';
import {SettingsButton} from '../components/settings-button';
import {GRAPHIC_BASE_1, TEXT_BASE_2} from '../variables';
import {getAppVersion, getBuildNumber} from '../services/version';

export const HomeSettingsScreen = () => {
  return (
    <Container>
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
        style={page.button}
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

      <Text t17 style={page.version}>
        Version {getAppVersion()} ({getBuildNumber()})
      </Text>

      <Spacer />
      {/*<SettingsButton*/}
      {/*  icon={<ISLMSettingsIcon color={GRAPHIC_BASE_1} />}*/}
      {/*  title="Test"*/}
      {/*  next="settingsTest"*/}
      {/*/>*/}
    </Container>
  );
};

const page = StyleSheet.create({
  button: {marginBottom: 20},
  version: {
    color: TEXT_BASE_2,
  },
});
