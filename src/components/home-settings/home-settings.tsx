import React, {memo} from 'react';

import {ScrollView} from 'react-native';

import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {useTesterModeEnabled} from '@app/hooks/use-tester-mode-enabled';
import {useWalletConnectAccounts} from '@app/hooks/use-wallet-connect-accounts';
import {I18N} from '@app/i18n';
import {SettingsStackRoutes} from '@app/route-types';
import {AppTheme} from '@app/types';
import {capitalize} from '@app/utils';

import {SettingsButton} from './settings-button';

import {IconsName} from '../ui';

type Props = {
  theme: AppTheme;
};

export const HomeSettings = memo(({theme}: Props) => {
  const capitalizedTheme = capitalize(theme);
  const {accounts} = useWalletConnectAccounts();
  const isTesterMode = useTesterModeEnabled();

  return (
    <ScrollView contentContainerStyle={page.container} testID="settings_home">
      <SettingsButton
        icon={IconsName.wallet}
        title={I18N.homeSettingsAccounts}
        next={SettingsStackRoutes.SettingsAccounts}
        testID="settings_manage_accounts"
      />

      <SettingsButton
        icon={IconsName.address_book}
        title={I18N.homeSettingsAddressBook}
        next={SettingsStackRoutes.SettingsAddressBook}
      />

      {!!accounts?.length && (
        <SettingsButton
          rightTitle={`${accounts.length}`}
          icon={IconsName.wallet_connect}
          title={I18N.homeSettingsWalletConnect}
          next={SettingsStackRoutes.WalletConnectWalletList}
        />
      )}

      <SettingsButton
        next={SettingsStackRoutes.SettingsCurrency}
        icon={IconsName.currency}
        title={I18N.homeSettingsCurrency}
      />

      <SettingsButton
        rightTitle={capitalizedTheme}
        icon={IconsName.brush}
        title={I18N.homeSettingsAppearance}
        next={SettingsStackRoutes.SettingsTheme}
      />

      <SettingsButton
        icon={IconsName.shield}
        title={I18N.homeSettingsSecurity}
        next={SettingsStackRoutes.SettingsSecurity}
      />

      <SettingsButton
        icon={IconsName.bell}
        title={I18N.homeSettingsNotification}
        next={SettingsStackRoutes.SettingsNotification}
      />

      <SettingsButton
        icon={IconsName.providers}
        title={I18N.homeSettingsProviders}
        next={SettingsStackRoutes.SettingsProviders}
        style={page.button}
      />

      <SettingsButton
        icon={IconsName.islm}
        title={I18N.homeSettingsAbout}
        next={SettingsStackRoutes.SettingsAbout}
        style={page.button}
      />

      {isTesterMode && (
        <SettingsButton
          icon={IconsName.settings}
          title={I18N.homeSettingsDeveloperTools}
          next={SettingsStackRoutes.SettingsDeveloperTools}
        />
      )}

      {app.isDeveloper && (
        <SettingsButton
          icon={IconsName.settings}
          title={I18N.homeSettingsTest}
          next={SettingsStackRoutes.SettingsTest}
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
