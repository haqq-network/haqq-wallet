import messaging from '@react-native-firebase/messaging';
import {Linking} from 'react-native';

import {Color} from '@app/colors';
import {app} from '@app/contexts';
import {onAppBackup} from '@app/event-actions/on-app-backup';
import {onBannerAddClaimCode} from '@app/event-actions/on-banner-add-claim-code';
import {onBannerAnalyticsCreate} from '@app/event-actions/on-banner-analytics-create';
import {onBannerGasdropCreate} from '@app/event-actions/on-banner-gasdrop-create';
import {onBannerNotificationCreate} from '@app/event-actions/on-banner-notification-create';
import {onBannerNotificationTopicCreate} from '@app/event-actions/on-banner-notification-topic-create';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Refferal} from '@app/models/refferal';
import {Wallet} from '@app/models/wallet';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents} from '@app/types';

import {onUpdatesSync} from './on-updates-sync';

/**
 * @description Called when app started (after logged in). Check banners, sync staking and updates
 */
export async function onAppStarted() {
  await EventTracker.instance.awaitForInitialization();
  EventTracker.instance.trackEvent(MarketingEvents.appStarted, {type: 'cold'});
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        app.emit(Events.onPushNotification, remoteMessage);
      }
    });

  const initialUrl = await Linking.getInitialURL();

  if (initialUrl) {
    app.emit(Events.onDeepLink, initialUrl, false, true);
  }

  Banner.removeAll();

  await onBannerNotificationCreate();

  await onBannerNotificationTopicCreate('news');

  await onBannerAnalyticsCreate();

  await onBannerGasdropCreate();

  const refferal = Refferal.getAll().filtered('isUsed = false');

  if (refferal.length) {
    for (const ref of refferal) {
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
  }

  await onUpdatesSync();
  await onAppBackup();
  await Wallet.fetchBalances();
  app.checkUpdate();
}
