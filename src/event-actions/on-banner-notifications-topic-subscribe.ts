import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Banner} from '@app/models/banner';
import {VariablesBool} from '@app/models/variables-bool';
import {PushNotifications} from '@app/services/push-notifications';
import {AdjustEvents} from '@app/types';

export async function onBannerNotificationsTopicSubscribe(
  id: string,
  topic: string,
) {
  await PushNotifications.instance.subscribeToTopic(topic);

  VariablesBool.set(`notificationsTopic:${topic}`, true);

  onTrackEvent(AdjustEvents.pushChannelSubscribe, {topic});

  Banner.remove(id);
}
