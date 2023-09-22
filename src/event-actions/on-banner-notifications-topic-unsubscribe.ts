import {Banner} from '@app/models/banner';
import {PushNotificationTopicsEnum} from '@app/services/push-notifications';

import {onNotificationsTopicUnsubscribe} from './on-notifications-topic-unsubscribe';

export async function onBannerNotificationsTopicUnsubscribe(
  id: string,
  topic: PushNotificationTopicsEnum,
) {
  await onNotificationsTopicUnsubscribe(topic);
  Banner.remove(id);
}
