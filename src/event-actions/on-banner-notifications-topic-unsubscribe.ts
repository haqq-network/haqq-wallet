import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Banner} from '@app/models/banner';
import {VariablesBool} from '@app/models/variables-bool';
import {PushNotifications} from '@app/services/push-notifications';
import {AdjustEvents} from '@app/types';

export async function onBannerNotificationsTopicUnsubscribe(
  id: string,
  topic: string,
) {
  await PushNotifications.instance.unsubscribeFromTopic(topic);

  onTrackEvent(AdjustEvents.pushChannelUnsubscribe, {topic});

  VariablesBool.set(`notificationsTopic:${topic}`, false);

  Banner.remove(id);
}
