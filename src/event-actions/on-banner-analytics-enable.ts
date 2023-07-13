import {Banner} from '@app/models/banner';
import {requestTrackingAuthorization} from '@app/utils';

export async function onBannerAnalyticsEnable(id: string) {
  await requestTrackingAuthorization();
  Banner.remove(id);
}
