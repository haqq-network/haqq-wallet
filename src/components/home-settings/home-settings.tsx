import React, {useState} from 'react';

import {observer} from 'mobx-react';
import {ScrollView} from 'react-native';

import {Color} from '@app/colors';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {
  checkNeedUpdate,
  getRemoteVersion,
} from '@app/helpers/check-app-version';
import {useTesterModeEnabled} from '@app/hooks/use-tester-mode-enabled';
import {useWalletConnectAccounts} from '@app/hooks/use-wallet-connect-accounts';
import {I18N} from '@app/i18n';
import {Currencies} from '@app/models/currencies';
import {Language} from '@app/models/language';
import {VariablesString} from '@app/models/variables-string';
import {SettingsStackRoutes} from '@app/route-types';
import {AppTheme} from '@app/types';
import {capitalize, openStorePage} from '@app/utils';

import {SettingsButton} from './settings-button';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconsName,
  InfoBlock,
  Spacer,
} from '../ui';

type Props = {
  theme: AppTheme;
};

export const HomeSettings = observer(({theme}: Props) => {
  const [appVersionHidden, setAppVersionHidden] = useState(false);
  const capitalizedTheme = capitalize(theme);
  const {accounts} = useWalletConnectAccounts();
  const isTesterMode = useTesterModeEnabled();
  const selectedCurrency = Currencies.selectedCurrency;
  const isUpdateNeeded = appVersionHidden ? false : checkNeedUpdate();
  const onHide = () => {
    setAppVersionHidden(true);
    VariablesString.set('version_to_ignore', getRemoteVersion()!);
  };

  return (
    <ScrollView contentContainerStyle={page.container} testID="settings_home">
      {isUpdateNeeded && (
        <InfoBlock
          testID="recovery_warning"
          border
          icon={
            <Icon
              i24
              name={IconsName.refresh_double}
              color={Color.graphicBase1}
            />
          }
          i18n={I18N.settingsOutdatedApp}
          bottomContainerStyle={page.row}
          style={page.inifoBlock}
          bottom={
            <>
              <Button
                style={page.flex}
                size={ButtonSize.small}
                i18n={I18N.newUpdateCancel}
                variant={ButtonVariant.second}
                testID="recovery_phrase"
                onPress={onHide}
              />
              <Spacer width={10} />
              <Button
                style={page.flex}
                size={ButtonSize.small}
                i18n={I18N.newUpdateAccept}
                variant={ButtonVariant.contained}
                //@ts-ignore
                onPress={openStorePage}
              />
            </>
          }
        />
      )}
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
        rightTitle={selectedCurrency}
        next={SettingsStackRoutes.SettingsCurrency}
        icon={IconsName.currency}
        title={I18N.homeSettingsCurrency}
      />

      <SettingsButton
        rightTitle={Language.current}
        next={SettingsStackRoutes.SettingsLanguage}
        icon={IconsName.language}
        title={I18N.homeSettingsLanguage}
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
  inifoBlock: {
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
  container: {
    marginHorizontal: 20,
  },
  button: {
    marginBottom: 20,
  },
});
