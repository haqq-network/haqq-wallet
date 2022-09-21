import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/container';
import {SettingsButton} from '../components/settings-button';
import {
  AddressBookSettingsIcon,
  HelpSettingsIcon,
  ISLMSettingsIcon,
  LanguageSettingsIcon,
  ShieldSettingsIcon,
  Spacer,
  WalletIcon,
} from '../components/ui';
import {GRAPHIC_BASE_1} from '../variables';

type HomeSettingsScreenProp = CompositeScreenProps<any, any>;

export const HomeSettingsScreen = ({navigation}: HomeSettingsScreenProp) => {
  const onClickButton = (screen?: string) => {
    if (screen) {
      navigation.navigate(screen);
    }
  };

  return (
    <Container>
      <SettingsButton
        icon={<WalletIcon color={GRAPHIC_BASE_1} />}
        title="Manage accounts"
        onPress={onClickButton}
        next="settingsAccounts"
      />

      <SettingsButton
        icon={<AddressBookSettingsIcon color={GRAPHIC_BASE_1} />}
        title="Address book"
        onPress={onClickButton}
        next="settingsAddressBook"
      />

      <SettingsButton
        icon={<LanguageSettingsIcon color={GRAPHIC_BASE_1} />}
        title="Language"
        onPress={onClickButton}
        next="settingsLanguage"
      />

      <SettingsButton
        icon={<ShieldSettingsIcon color={GRAPHIC_BASE_1} />}
        title="Security"
        onPress={onClickButton}
        next="settingsSecurity"
      />

      <SettingsButton
        icon={<HelpSettingsIcon color={GRAPHIC_BASE_1} />}
        title="FAQ"
        onPress={onClickButton}
        next="settingsFaq"
      />

      <SettingsButton
        icon={<ISLMSettingsIcon color={GRAPHIC_BASE_1} />}
        title="About"
        onPress={onClickButton}
        next="settingsAbout"
      />
      <Spacer />
    </Container>
  );
};
