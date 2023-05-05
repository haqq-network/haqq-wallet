import {Banner} from '@app/models/banner';
import {VariablesBool} from '@app/models/variables-bool';
import {PushNotifications} from '@app/services/push-notifications';

export async function onBannerNotificationsTopicUnsubscribe(
  id: string,
  topic: string,
) {
  await PushNotifications.instance.unsubscribeFromTopic(topic);

  VariablesBool.set(`notificationsTopic:${topic}`, false);

  Banner.remove(id);
}
