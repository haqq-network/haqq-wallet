import {isAfter} from 'date-fns';

import {Color, getColor} from '@app/colors';
import {app} from '@app/contexts';
import {Banner, BannerButtonEvent, BannerType} from '@app/models/banner';
import {VariablesDate} from '@app/models/variables-date';
import {PopupNotificationBannerTypes} from '@app/types';

export async function onBannerNotificationCreate() {
  if (app.notifications) {
    return;
  }

  const snoozed = VariablesDate.get('snoozeNotifications');

  if (snoozed && isAfter(snoozed, new Date())) {
    return;
  }

  Banner.create({
    id: PopupNotificationBannerTypes.notification,
    title: 'Wallet Notifications',
    description: 'You will be notified of sent and received transactions',
    descriptionColor: getColor(Color.textBase3),
    type: BannerType.notifications,
    backgroundColorFrom: '#1B6EE5',
    backgroundColorTo: '#2C8EEB',
    defaultEvent: BannerButtonEvent.notificationsEnable,
    closeEvent: BannerButtonEvent.notificationsSnooze,
    backgroundImage: 'banner_notifications',
  });
}
