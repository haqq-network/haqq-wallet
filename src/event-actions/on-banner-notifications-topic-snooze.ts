import {addMinutes} from 'date-fns';

import {Banner} from '@app/models/banner';
import {VariablesDate} from '@app/models/variables-date';

export async function onBannerNotificationsTopicSnooze(
  id: string,
  topic: string,
) {
  const banner = Banner.getById(id);

  if (!banner) {
    throw new Error('Banner not found');
  }

  VariablesDate.set(
    `snoozeNotificationsTopic:${topic}`,
    addMinutes(new Date(), 5 * 1440),
  );

  Banner.remove(id);
}
