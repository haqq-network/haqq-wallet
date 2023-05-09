import {Adjust, AdjustEvent} from 'react-native-adjust';

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

  const adjustEvent = new AdjustEvent(AdjustEvents.pushChannelSubscribe);
  adjustEvent.addPartnerParameter('topic', topic);
  Adjust.trackEvent(adjustEvent);

  Banner.remove(id);
}
