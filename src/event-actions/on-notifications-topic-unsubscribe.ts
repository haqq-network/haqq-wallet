import {onTrackEvent} from '@app/event-actions/on-track-event';
import {VariablesBool} from '@app/models/variables-bool';
import {
  PushNotificationTopicsEnum,
  PushNotifications,
} from '@app/services/push-notifications';
import {AdjustEvents} from '@app/types';

export async function onNotificationsTopicUnsubscribe(
  topic: PushNotificationTopicsEnum,
) {
  await PushNotifications.instance.unsubscribeFromTopic(topic);
  VariablesBool.set(`notificationsTopic:${topic}`, false);
  onTrackEvent(AdjustEvents.pushChannelUnsubscribe, {topic});
}
