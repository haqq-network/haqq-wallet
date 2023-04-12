import {addMinutes} from 'date-fns';

import {Banner} from '@app/models/banner';
import {SNOOZE_WALLET_BACKUP_MINUTES} from '@app/variables/common';

export async function onBannerSnoozeUntil(id: string) {
  const banner = Banner.getById(id);

  if (!banner) {
    throw new Error('Banner not found');
  }

  banner.update({
    snoozedUntil: addMinutes(new Date(), SNOOZE_WALLET_BACKUP_MINUTES),
  });
}
