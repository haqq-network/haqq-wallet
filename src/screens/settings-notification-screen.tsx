import React, {useCallback, useEffect, useState} from 'react';

import {Linking, SwitchChangeEvent} from 'react-native';

import {SettingsNotification} from '@app/components/settings-notification';
import {app} from '@app/contexts';
import {onBannerNotificationsTopicSubscribe} from '@app/event-actions/on-banner-notifications-topic-subscribe';
import {onBannerNotificationsTopicUnsubscribe} from '@app/event-actions/on-banner-notifications-topic-unsubscribe';
import {Events} from '@app/events';
import {useTypedNavigation} from '@app/hooks';
import {VariablesBool} from '@app/models/variables-bool';
import {
  PushNotificationTopicsEnum,
  PushNotifications,
} from '@app/services/push-notifications';

const TRANSACTION_TOPIC_VARIABLE_NAME = `notificationsTopic:${PushNotificationTopicsEnum.transactions}`;
const NEWS_TOPIC_VARIABLE_NAME = `notificationsTopic:${PushNotificationTopicsEnum.news}`;

export const SettingsNotificationScreen = () => {
  const navigation = useTypedNavigation();
  const [
    transactionPushNotificationEnabled,
    setTransactionPushNotificationEnabled,
  ] = useState(VariablesBool.get(TRANSACTION_TOPIC_VARIABLE_NAME));
  const [newsPushNotificationEnabled, setNewsPushNotificationEnabled] =
    useState(VariablesBool.get(NEWS_TOPIC_VARIABLE_NAME));
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);

  const onToggleTransactionPushNotification = useCallback(
    async ({nativeEvent: {value}}: SwitchChangeEvent) => {
      VariablesBool.set(TRANSACTION_TOPIC_VARIABLE_NAME, value);
      setTransactionPushNotificationEnabled(value);

      if (value) {
        await PushNotifications.instance.subscribeToTopic(
          PushNotificationTopicsEnum.transactions,
        );
      } else {
        await PushNotifications.instance.unsubscribeFromTopic(
          PushNotificationTopicsEnum.transactions,
        );
      }
    },
    [],
  );

  const onToggleNewsPushNotification = useCallback(
    async ({nativeEvent: {value}}: SwitchChangeEvent) => {
      setNewsPushNotificationEnabled(value);

      if (value) {
        await onBannerNotificationsTopicSubscribe(
          'notificationTopic:news',
          'news',
        );
      } else {
        await onBannerNotificationsTopicUnsubscribe(
          'notificationTopic:news',
          'news',
        );
      }
    },
    [],
  );

  const onPressGoToPhoneSettings = useCallback(() => {
    Linking.openSettings().then();
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await PushNotifications.instance.hasPermission();
      setHasNotificationPermission(hasPermission);
      if (!hasPermission) {
        navigation.navigate('popupNotification', {bannerId: 'notification'});
      }
    };

    checkPermission().then();
    app.on(Events.onAppActive, checkPermission);

    return () => {
      app.removeListener(Events.onAppActive, checkPermission);
    };
  }, [navigation]);

  return (
    <SettingsNotification
      onPressGoToPhoneSettings={onPressGoToPhoneSettings}
      hasNotificationPermission={hasNotificationPermission}
      transactionPushNotificationEnabled={transactionPushNotificationEnabled}
      newsPushNotificationEnabled={newsPushNotificationEnabled}
      onToggleNewsPushNotification={onToggleNewsPushNotification}
      onToggleTransactionPushNotification={onToggleTransactionPushNotification}
    />
  );
};
