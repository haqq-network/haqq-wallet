import {Banner} from '@app/models/banner';
import {SystemDialog} from '@app/services/system-dialog';

export async function onBannerAnalyticsEnable(id: string) {
  await SystemDialog.requestTrackingAuthorization();
  Banner.remove(id);
}
