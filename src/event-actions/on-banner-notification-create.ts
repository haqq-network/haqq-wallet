import {isAfter} from 'date-fns';

import {Color, getColor} from '@app/colors';
import {Banner} from '@app/models/banner';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';

export async function onBannerNotificationCreate() {
  if (VariablesBool.get('notifications')) {
    return;
  }

  const snoozed = VariablesDate.get('snoozeNotifications');

  if (snoozed && isAfter(snoozed, new Date())) {
    return;
  }

  Banner.create({
    id: 'notifications',
    title: 'Wallet Notifications',
    type: 'notifications',
    buttons: [
      {
        id: new Realm.BSON.UUID(),
        title: 'Turn on',
        event: 'notificationsTurnOn',
        params: {},
        color: getColor(Color.textGreen1),
        backgroundColor: getColor(Color.bg2),
      },
    ],
    backgroundColorFrom: '#1B6EE5',
    backgroundColorTo: '#2C8EEB',
  });
}
