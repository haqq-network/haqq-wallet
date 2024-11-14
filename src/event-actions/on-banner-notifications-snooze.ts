import {addMinutes} from 'date-fns';

import {VariablesDate} from '@app/models/variables-date';

export async function onBannerNotificationsSnooze() {
  VariablesDate.set('snoozeNotifications', addMinutes(new Date(), 5 * 1440));
}
