import {isAfter} from 'date-fns';

import {Color} from '@app/colors';
import {Banner} from '@app/models/banner';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';

const topics: Record<string, any> = {
  news: {
    title: 'Subscribe to the news',
    description: 'Get the latest news on IslamicCoin and our crypto wallet',
    type: 'notificationsTopic',
    backgroundColorFrom: 'transparent',
    backgroundColorTo: 'transparent',
    backgroundBorder: Color.graphicSecond1,
    titleColor: Color.textBase1,
    descriptionColor: Color.textBase1,
    closeButtonColor: Color.graphicBase2,
    defaultEvent: 'notificationsTopicSubscribe',
    defaultParams: {
      topic: 'news',
    },
    closeEvent: 'notificationsTopicSnooze',
    closeParams: {
      topic: 'news',
    },
  },
};

type Keys = keyof typeof topics;

export async function onBannerNotificationTopicCreate(topic: Keys) {
  if (!VariablesBool.get('notifications')) {
    return;
  }

  // if (VariablesBool.get(`notificationsTopic:${topic}`)) {
  //   return;
  // }

  const snoozed = VariablesDate.get(`snoozeNotificationsTopic:${topic}`);

  if (snoozed && isAfter(snoozed, new Date())) {
    return;
  }
  Banner.create({
    id: `notificationTopic:${topic}`,
    ...(topics[topic] ?? {}),
  });
}
