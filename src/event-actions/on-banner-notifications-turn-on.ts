import {app} from '@app/contexts';
import {onPushSubscriptionTransactionsSubscribe} from '@app/event-actions/on-push-subscription-transactions-subscribe';
import {showModal} from '@app/helpers';
import {Banner} from '@app/models/banner';
import {navigator} from '@app/navigator';
import {
  PushNotificationTopicsEnum,
  PushNotifications,
} from '@app/services/push-notifications';
import {ModalType, PopupNotificationBannerId} from '@app/types';

import {onBannerNotificationsTopicSubscribe} from './on-banner-notifications-topic-subscribe';

export async function onBannerNotificationsTurnOn(
  id: PopupNotificationBannerId,
) {
  try {
    const onSuccess = async () => {
      await onPushSubscriptionTransactionsSubscribe();
      await onBannerNotificationsTopicSubscribe(
        'notificationTopic:news',
        PushNotificationTopicsEnum.news,
      );
    };

    const onFailed = () => {
      if (app.onboarded) {
        navigator.navigate('settingsNotification');
      }
    };

    const isBlocked = await PushNotifications.instance.hasPermissionsBlocked();
    const isAlreadyTaken = await PushNotifications.instance.hasPermission();

    if (!isBlocked && !isAlreadyTaken) {
      showModal(ModalType.turnOnPushNotifications, {
        onSuccess,
        onFailed,
        onClose: () => Banner.remove(id),
      });
    }
  } catch (e) {
    Logger.captureException(e, 'onBannerNotificationsTurnOn', {id});
  }
}
