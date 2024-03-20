import {VariablesBool} from '@app/models/variables-bool';
import {EventTracker} from '@app/services/event-tracker';
import {
  PushNotificationTopicsEnum,
  PushNotifications,
} from '@app/services/push-notifications';
import {MarketingEvents} from '@app/types';

export async function onNotificationsTopicUnsubscribe(
  topic: PushNotificationTopicsEnum,
) {
  await PushNotifications.instance.unsubscribeFromTopic(topic);
  VariablesBool.set(`notificationsTopic:${topic}`, false);
  EventTracker.instance.trackEvent(MarketingEvents.pushChannelUnsubscribe, {
    topic,
  });
}
