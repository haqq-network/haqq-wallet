import React, {memo} from 'react';

import {ScrollView} from 'react-native';

import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {useWalletConnectAccounts} from '@app/hooks/use-wallet-connect-accounts';
import {I18N} from '@app/i18n';
import {AppTheme} from '@app/types';
import {capitalize} from '@app/utils';

import {SettingsButton} from './settings-button';

type Props = {
  theme: AppTheme;
};

export const HomeSettings = memo(({theme}: Props) => {
  const capitalizedTheme = capitalize(theme);
  const {accounts} = useWalletConnectAccounts();

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

      {!!accounts?.length && (
        <SettingsButton
          rightTitle={`${accounts.length}`}
          icon="wallet_connect"
          title={I18N.homeSettingsWalletConnect}
          next="walletConnectWalletList"
        />
      )}

      {/* <SettingsButton
        icon="language"
        rightTitle="EN"
        title={getText(I18N.homeSettingsLanguage)}
        next="settingsLanguage"
      /> */}

      <SettingsButton
        rightTitle={capitalizedTheme}
        icon="brush"
        title={I18N.homeSettingsAppearance}
        next="settingsTheme"
      />

      <SettingsButton
        icon="shield"
        title={I18N.homeSettingsSecurity}
        next="settingsSecurity"
      />

      <SettingsButton
        icon="bell"
        title={I18N.homeSettingsNotification}
        next="settingsNotification"
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

      {app.isDeveloper && (
        <SettingsButton
          icon="settings"
          title={I18N.homeSettingsTest}
          next="settingsTest"
          style={page.button}
        />
      )}
    </ScrollView>
  );
});

const page = createTheme({
  container: {
    marginHorizontal: 20,
  },
  button: {
    marginBottom: 20,
  },
});
