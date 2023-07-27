import {isAfter} from 'date-fns';

import {Color, getColor} from '@app/colors';
import {Banner} from '@app/models/banner';
import {VariablesDate} from '@app/models/variables-date';
import {AdjustTrackingAuthorizationStatus} from '@app/types';
import {getAppTrackingAuthorizationStatus} from '@app/utils';

export async function onBannerAnalyticsCreate() {
  const status = await getAppTrackingAuthorizationStatus();

  if (status !== AdjustTrackingAuthorizationStatus.userNotAsked) {
    return;
  }

  const snoozed = VariablesDate.get('analyticsNotifications');

  if (snoozed && isAfter(snoozed, new Date())) {
    return;
  }

  Banner.create({
    id: 'trackActivity',
    title: 'Improve the app',
    description:
      'Help us to collect more information about the problems of the application',
    descriptionColor: getColor(Color.textBase3),
    type: 'trackActivity',
    backgroundColorFrom: '#7F44FD',
    backgroundColorTo: '#2E54DC',
    defaultEvent: 'trackActivityClick',
    closeEvent: 'trackActivityClose',
    backgroundImage: 'banner_analytics',
  });
}
