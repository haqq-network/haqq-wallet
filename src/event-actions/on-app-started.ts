import messaging from '@react-native-firebase/messaging';
import {Linking} from 'react-native';

import {Color} from '@app/colors';
import {app} from '@app/contexts';
import {onAppBackup} from '@app/event-actions/on-app-backup';
import {onBannerAddClaimCode} from '@app/event-actions/on-banner-add-claim-code';
import {onBannerAnalyticsCreate} from '@app/event-actions/on-banner-analytics-create';
import {onBannerNotificationCreate} from '@app/event-actions/on-banner-notification-create';
import {onBannerNotificationTopicCreate} from '@app/event-actions/on-banner-notification-topic-create';
import {onNewsSync} from '@app/event-actions/on-news-sync';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Refferal} from '@app/models/refferal';

export async function onAppStarted() {
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        app.emit(Events.onPushNotification, remoteMessage);
      }
    });

  const initialUrl = await Linking.getInitialURL();

  if (initialUrl && initialUrl.startsWith('haqq:')) {
    app.emit(Events.onDeepLink, initialUrl);
  }

  Banner.removeAll();

  await onBannerNotificationCreate();

  await onBannerNotificationTopicCreate('news');

  await onBannerAnalyticsCreate();

  const refferal = Refferal.getAll().filtered('isUsed = false');

  if (refferal.length) {
    const ref = refferal[0];
    try {
      await onBannerAddClaimCode(ref.code);
    } catch (e) {
      if (e instanceof Error) {
        showModal('error', {
          title: getText(I18N.modalRewardErrorTitle),
          description: e.message,
          close: getText(I18N.modalRewardErrorClose),
          icon: 'reward_error',
          color: Color.graphicSecond4,
        });

        ref.update({
          isUsed: true,
        });
      }
    }
  }

  await onNewsSync();
  await onAppBackup();
}
