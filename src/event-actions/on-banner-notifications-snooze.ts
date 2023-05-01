import {addMinutes} from 'date-fns';

import {Banner} from '@app/models/banner';
import {VariablesDate} from '@app/models/variables-date';

export async function onBannerNotificationsSnooze(id: string) {
  const banner = Banner.getById(id);

  if (!banner) {
    throw new Error('Banner not found');
  }

  VariablesDate.set('snoozeNotifications', addMinutes(new Date(), 5 * 1440));

  Banner.remove(id);
}
