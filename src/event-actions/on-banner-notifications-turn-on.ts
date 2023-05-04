import {onBannerNotificationTopicCreate} from '@app/event-actions/on-banner-notification-topic-create';
import {onPushSubscriptionAdd} from '@app/event-actions/on-push-subscription-add';
import {Banner} from '@app/models/banner';
import {PushNotifications} from '@app/services/push-notifications';
import {PopupNotificationBannerId} from '@app/types';

export async function onBannerNotificationsTurnOn(
  id: PopupNotificationBannerId,
) {
  await PushNotifications.instance.requestPermissions();

  await onPushSubscriptionAdd();
  await onBannerNotificationTopicCreate('news');

  Banner.remove(id);
}
