import {Adjust, AdjustEvent} from 'react-native-adjust';

import {Banner} from '@app/models/banner';
import {VariablesBool} from '@app/models/variables-bool';
import {PushNotifications} from '@app/services/push-notifications';
import {AdjustEvents} from '@app/types';

export async function onBannerNotificationsTopicUnsubscribe(
  id: string,
  topic: string,
) {
  await PushNotifications.instance.unsubscribeFromTopic(topic);

  const adjustEvent = new AdjustEvent(AdjustEvents.pushChannelUnsubscribe);
  adjustEvent.addPartnerParameter('topic', topic);
  Adjust.trackEvent(adjustEvent);

  VariablesBool.set(`notificationsTopic:${topic}`, false);

  Banner.remove(id);
}
