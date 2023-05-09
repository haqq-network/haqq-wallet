import {Adjust} from 'react-native-adjust';

import {Banner} from '@app/models/banner';

export async function onBannerAnalyticsEnable(id: string) {
  await new Promise(resolve => {
    Adjust.requestTrackingAuthorizationWithCompletionHandler(s => {
      resolve(s);
    });
  });

  Banner.remove(id);
}
