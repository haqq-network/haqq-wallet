import {VariablesBool} from '@app/models/variables-bool';
import {VariablesString} from '@app/models/variables-string';
import {
  PushNotificationTopicsEnum,
  PushNotifications,
} from '@app/services/push-notifications';

export async function onPushSubscriptionTransactionsUnsubscribe() {
  VariablesBool.set(
    `notificationsTopic:${PushNotificationTopicsEnum.transactions}`,
    false,
  );

  const subscription = VariablesString.get('notificationToken');

  if (subscription) {
    await PushNotifications.instance.unsubscribeByToken(subscription);
  }
}
