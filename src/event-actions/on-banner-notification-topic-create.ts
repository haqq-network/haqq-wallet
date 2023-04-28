import {isAfter} from 'date-fns';

import {Color, getColor} from '@app/colors';
import {Banner} from '@app/models/banner';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';

const topics: Record<string, any> = {
  news: {
    title: 'IslamicCoin News',
    type: 'notificationsTopic',
    buttons: [
      {
        id: new Realm.BSON.UUID(),
        title: 'Subscribe',
        event: 'notificationsTopicSubscribe',
        params: {
          topic: 'news',
        },
        color: getColor(Color.textGreen1),
        backgroundColor: getColor(Color.bg2),
      },
    ],
    backgroundColorFrom: '#1B6EE5',
    backgroundColorTo: '#2C8EEB',
  },
};

type Keys = keyof typeof topics;

export async function onBannerNotificationTopicCreate(topic: Keys) {
  if (!VariablesBool.get('notifications')) {
    return;
  }

  if (VariablesBool.get(`notificationsTopic:${topic}`)) {
    return;
  }

  const snoozed = VariablesDate.get(`snoozeNotificationsTopic:${topic}`);

  if (snoozed && isAfter(snoozed, new Date())) {
    return;
  }
  Banner.create({
    id: `notificationTopic:${topic}`,
    ...(topics[topic] ?? {}),
  });
}
