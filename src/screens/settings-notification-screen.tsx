import React, {useCallback, useEffect, useState} from 'react';

import {Linking, SwitchChangeEvent} from 'react-native';

import {SettingsNotification} from '@app/components/settings-notification';
import {app} from '@app/contexts';
import {onBannerNotificationsTopicSubscribe} from '@app/event-actions/on-banner-notifications-topic-subscribe';
import {onBannerNotificationsTopicUnsubscribe} from '@app/event-actions/on-banner-notifications-topic-unsubscribe';
import {onBannerNotificationsTurnOn} from '@app/event-actions/on-banner-notifications-turn-on';
import {onPushSubscriptionTransactionsSubscribe} from '@app/event-actions/on-push-subscription-transactions-subscribe';
import {onPushSubscriptionTransactionsUnsubscribe} from '@app/event-actions/on-push-subscription-transactions-unsubscribe';
import {Events} from '@app/events';
import {useTypedNavigation} from '@app/hooks';
import {usePrevious} from '@app/hooks/use-previous';
import {VariablesBool} from '@app/models/variables-bool';
import {
  PushNotificationTopicsEnum,
  PushNotifications,
} from '@app/services/push-notifications';
import {PopupNotificationBannerTypes} from '@app/types';

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
  const prevHasNotificationPermission = usePrevious(hasNotificationPermission);
  const onToggleTransactionPushNotification = useCallback(
    async ({nativeEvent: {value}}: SwitchChangeEvent) => {
      setTransactionPushNotificationEnabled(value);

      if (value) {
        await onPushSubscriptionTransactionsSubscribe();
      } else {
        await onPushSubscriptionTransactionsUnsubscribe();
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
      if (
        prevHasNotificationPermission !== hasPermission &&
        hasPermission &&
        !VariablesBool.get('notifications')
      ) {
        await onBannerNotificationsTurnOn(
          PopupNotificationBannerTypes.notification,
        );
      }
      setHasNotificationPermission(hasPermission);
    };

    checkPermission().then();
    app.on(Events.onAppActive, checkPermission);

    return () => {
      app.removeListener(Events.onAppActive, checkPermission);
    };
  }, [navigation, prevHasNotificationPermission, setHasNotificationPermission]);

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
