import {addMinutes} from 'date-fns';

import {Banner} from '@app/models/banner';
import {VariablesDate} from '@app/models/variables-date';

export async function onBannerAnalyticsSnooze(id: string) {
  VariablesDate.set('snoozeAnalytics', addMinutes(new Date(), 5 * 1440));

  Banner.remove(id);
}
