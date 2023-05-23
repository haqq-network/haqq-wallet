import React from 'react';

import {StyleSheet, Switch, SwitchChangeEvent, View} from 'react-native';

import {SettingsNotificationNoPermission} from '@app/components/notification-settings-no-permission';
import {DataContent, MenuNavigationButton, Spacer} from '@app/components/ui';
import {I18N} from '@app/i18n';

export interface SettingsNotificationProps {
  hasNotificationPermission: boolean;
  transactionPushNotificationEnabled: boolean;
  newsPushNotificationEnabled: boolean;
  onToggleTransactionPushNotification: (event: SwitchChangeEvent) => void;
  onToggleNewsPushNotification: (event: SwitchChangeEvent) => void;
  onPressGoToPhoneSettings: () => void;
}

export const SettingsNotification = ({
  hasNotificationPermission,
  transactionPushNotificationEnabled,
  newsPushNotificationEnabled,
  onToggleTransactionPushNotification,
  onToggleNewsPushNotification,
  onPressGoToPhoneSettings,
}: SettingsNotificationProps) => {
  if (!hasNotificationPermission) {
    return (
      <SettingsNotificationNoPermission
        onPressGoToPhoneSettings={onPressGoToPhoneSettings}
      />
    );
  }

  return (
    <View style={styles.container}>
      <MenuNavigationButton hideArrow onPress={() => {}}>
        <DataContent
          style={styles.dataContent}
          titleI18n={I18N.transactionPushNotification}
          subtitleI18n={I18N.transactionPushNotificationsDescription}
        />
        <Spacer />
        <Switch
          value={transactionPushNotificationEnabled}
          onChange={onToggleTransactionPushNotification}
        />
      </MenuNavigationButton>

      <MenuNavigationButton hideArrow onPress={() => {}}>
        <DataContent
          style={styles.dataContent}
          titleI18n={I18N.newsPushNotification}
          subtitleI18n={I18N.newsPushNotificationsDescription}
        />
        <Spacer />
        <Switch
          value={newsPushNotificationEnabled}
          onChange={onToggleNewsPushNotification}
        />
      </MenuNavigationButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    alignItems: 'center',
  },
  dataContent: {
    flex: 4,
  },
});
