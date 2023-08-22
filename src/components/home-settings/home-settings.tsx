import React from 'react';

import {ScrollView} from 'react-native';

import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {useWalletConnectAccounts} from '@app/hooks/use-wallet-connect-accounts';
import {I18N} from '@app/i18n';
import {SettingsStackRoutes} from '@app/screens/HomeStack/SettingsStack';
import {capitalize} from '@app/utils';

import {SettingsButton} from './settings-button';

export const HomeSettings = () => {
  const capitalizedTheme = capitalize(app.theme);
  const {accounts} = useWalletConnectAccounts();

  return (
    <ScrollView contentContainerStyle={page.container}>
      <SettingsButton
        icon="wallet"
        title={I18N.homeSettingsAccounts}
        next={SettingsStackRoutes.SettingsAccounts}
      />

      <SettingsButton
        icon="address_book"
        title={I18N.homeSettingsAddressBook}
        next={SettingsStackRoutes.SettingsAddressBook}
      />

      {!!accounts?.length && (
        <SettingsButton
          rightTitle={`${accounts.length}`}
          icon="wallet_connect"
          title={I18N.homeSettingsWalletConnect}
          next={SettingsStackRoutes.WalletConnectWalletList}
        />
      )}

      <SettingsButton
        rightTitle={capitalizedTheme}
        icon="brush"
        title={I18N.homeSettingsAppearance}
        next={SettingsStackRoutes.SettingsTheme}
      />

      <SettingsButton
        icon="shield"
        title={I18N.homeSettingsSecurity}
        next={SettingsStackRoutes.SettingsSecurity}
      />

      <SettingsButton
        icon="bell"
        title={I18N.homeSettingsNotification}
        next={SettingsStackRoutes.SettingsNotification}
      />

      <SettingsButton
        icon="providers"
        title={I18N.homeSettingsProviders}
        next={SettingsStackRoutes.SettingsProviders}
        style={page.button}
      />

      <SettingsButton
        icon="islm"
        title={I18N.homeSettingsAbout}
        next={SettingsStackRoutes.SettingsAbout}
        style={page.button}
      />

      {app.isDeveloper && (
        <SettingsButton
          icon="settings"
          title={I18N.homeSettingsTest}
          next={SettingsStackRoutes.SettingsTest}
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
