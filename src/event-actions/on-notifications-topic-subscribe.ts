import {onTrackEvent} from '@app/event-actions/on-track-event';
import {VariablesBool} from '@app/models/variables-bool';
import {
  PushNotificationTopicsEnum,
  PushNotifications,
} from '@app/services/push-notifications';
import {AdjustEvents} from '@app/types';

export async function onNotificationsTopicSubscribe(
  topic: PushNotificationTopicsEnum,
) {
  await PushNotifications.instance.subscribeToTopic(topic);
  VariablesBool.set(`notificationsTopic:${topic}`, true);
  onTrackEvent(AdjustEvents.pushChannelSubscribe, {topic});
}
