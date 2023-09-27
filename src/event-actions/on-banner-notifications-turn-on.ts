import {app} from '@app/contexts';
import {onPushSubscriptionTransactionsSubscribe} from '@app/event-actions/on-push-subscription-transactions-subscribe';
import {Banner} from '@app/models/banner';
import {navigator} from '@app/navigator';
import {
  PushNotificationTopicsEnum,
  PushNotifications,
} from '@app/services/push-notifications';
import {PopupNotificationBannerId} from '@app/types';

import {onBannerNotificationsTopicSubscribe} from './on-banner-notifications-topic-subscribe';

export async function onBannerNotificationsTurnOn(
  id: PopupNotificationBannerId,
) {
  try {
    const enabled = await PushNotifications.instance.requestPermissions();

    if (enabled) {
      await onPushSubscriptionTransactionsSubscribe();
      await onBannerNotificationsTopicSubscribe(
        'notificationTopic:news',
        PushNotificationTopicsEnum.news,
      );
    } else if (app.onboarded) {
      navigator.navigate('settingsNotification');
    }

    Banner.remove(id);
  } catch (e) {
    Logger.captureException(e, 'onBannerNotificationsTurnOn', {id});
  }
}
