import {onBannerNotificationTopicCreate} from '@app/event-actions/on-banner-notification-topic-create';
import {onPushSubscriptionTransactionsSubscribe} from '@app/event-actions/on-push-subscription-transactions-subscribe';
import {captureException} from '@app/helpers';
import {Banner} from '@app/models/banner';
import {PushNotifications} from '@app/services/push-notifications';
import {PopupNotificationBannerId} from '@app/types';

export async function onBannerNotificationsTurnOn(
  id: PopupNotificationBannerId,
) {
  try {
    await PushNotifications.instance.requestPermissions();

    await onPushSubscriptionTransactionsSubscribe();
    await onBannerNotificationTopicCreate('news');

    Banner.remove(id);
  } catch (e) {
    captureException(e, 'onBannerNotificationsTurnOn', {id});
  }
}
