import {Adjust, AdjustEvent} from 'react-native-adjust';

import {onBannerNotificationTopicCreate} from '@app/event-actions/on-banner-notification-topic-create';
import {onPushSubscriptionTransactionsSubscribe} from '@app/event-actions/on-push-subscription-transactions-subscribe';
import {Banner} from '@app/models/banner';
import {PushNotifications} from '@app/services/push-notifications';
import {AdjustEvents, PopupNotificationBannerId} from '@app/types';

export async function onBannerNotificationsTurnOn(
  id: PopupNotificationBannerId,
) {
  await PushNotifications.instance.requestPermissions();

  Adjust.trackEvent(new AdjustEvent(AdjustEvents.pushNotifications));

  await onPushSubscriptionTransactionsSubscribe();
  await onBannerNotificationTopicCreate('news');

  Banner.remove(id);
}
