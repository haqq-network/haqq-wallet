import {VariablesBool} from '@app/models/variables-bool';
import {EventTracker} from '@app/services/event-tracker';
import {
  PushNotificationTopicsEnum,
  PushNotifications,
} from '@app/services/push-notifications';
import {MarketingEvents} from '@app/types';

export async function onNotificationsTopicSubscribe(
  topic: PushNotificationTopicsEnum,
) {
  await PushNotifications.instance.subscribeToTopic(topic);
  VariablesBool.set(`notificationsTopic:${topic}`, true);
  EventTracker.instance.trackEvent(MarketingEvents.pushChannelSubscribe, {
    topic,
  });
}
