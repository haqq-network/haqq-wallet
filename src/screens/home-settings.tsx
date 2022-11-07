import React from 'react';

import {Image, ScrollView} from 'react-native';

import {Color, getColor} from '../colors';
import {SettingsButton} from '../components/settings-button';
import {Icon} from '../components/ui';
import {createTheme} from '../helpers/create-theme';
import {useTheme} from '../hooks/use-theme';

export const HomeSettingsScreen = () => {
  const theme = useTheme();
  return (
    <ScrollView contentContainerStyle={page.container} key={theme}>
      <SettingsButton
        icon={<Icon s name="wallet" color={getColor(Color.graphicBase1)} />}
        title="Manage accounts"
        next="settingsAccounts"
      />

      <SettingsButton
        icon={
          <Icon s name="addressBook" color={getColor(Color.graphicBase1)} />
        }
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
        icon={<Image source={{uri: 'brush'}} style={page.icon} />}
        title="Appearance"
        next="settingsTheme"
      />

      <SettingsButton
        icon={<Icon s name="shield" color={getColor(Color.graphicBase1)} />}
        title="Security"
        next="settingsSecurity"
      />

      <SettingsButton
        title="Providers"
        icon={<Icon s name="providers" color={getColor(Color.graphicBase1)} />}
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
        icon={<Icon s name="islm" color={getColor(Color.graphicBase1)} />}
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

const page = createTheme({
  container: {marginHorizontal: 20},
  button: {marginBottom: 20},
});
