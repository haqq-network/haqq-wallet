import {Banner} from '@app/models/banner';
import {PushNotificationTopicsEnum} from '@app/services/push-notifications';

import {onNotificationsTopicSubscribe} from './on-notifications-topic-subscribe';

export async function onBannerNotificationsTopicSubscribe(
  id: string,
  topic: PushNotificationTopicsEnum,
) {
  await onNotificationsTopicSubscribe(topic);
  Banner.remove(id);
}
