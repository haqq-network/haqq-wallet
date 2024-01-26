import {VariablesBool} from '@app/models/variables-bool';
import {VariableString} from '@app/models/variables-string';
import {Backend} from '@app/services/backend';
import {PushNotificationTopicsEnum} from '@app/services/push-notifications';

export async function onPushSubscriptionTransactionsUnsubscribe() {
  VariablesBool.set(
    `notificationsTopic:${PushNotificationTopicsEnum.transactions}`,
    false,
  );

  const subscription = VariableString.get('notificationToken');

  if (subscription) {
    await Backend.instance.unsubscribeByToken(subscription);
  }
}
