import {Banner} from '@app/models/banner';
import {navigator} from '@app/navigator';

export async function onBannerAnalyticsCreate(id: string) {
  const banner = Banner.getById(id);

  if (!banner) {
    throw new Error('Banner not found');
  }

  navigator.navigate('popupTrackActivity', {
    bannerId: id,
  });
}
