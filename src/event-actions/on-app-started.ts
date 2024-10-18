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

async function initMessaging() {
  try {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      app.emit(Events.onPushNotification, remoteMessage);
    }
  } catch (err) {
    Logger.error('initMessaging', err);
    Logger.captureException(err, 'initMessaging');
  }
}

async function initDeepLinks() {
  try {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      app.emit(Events.onDeepLink, initialUrl, false, true);
    }

    Linking.addEventListener('url', ({url}) => {
      app.emit(Events.onDeepLink, url, false, false);
    });
  } catch (err) {
    Logger.error('initDeepLinks', err);
    Logger.captureException(err, 'initDeepLinks');
  }
}

async function initBanners() {
  try {
    Banner.removeAll();
    await onBannerNotificationCreate();
    await onBannerNotificationTopicCreate('news');
    await onBannerAnalyticsCreate();
    await onBannerGasdropCreate();
  } catch (err) {
    Logger.error('initBanners', err);
    Logger.captureException(err, 'initBanners');
  }
}

async function initRefferal() {
  try {
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
  } catch (err) {
    Logger.error('initRefferal', err);
    Logger.captureException(err, 'initRefferal');
  }
}

/**
 * @description Called when app started (after logged in). Check banners, sync staking and updates
 */
export async function onAppStarted() {
  try {
    await EventTracker.instance.awaitForInitialization();
    EventTracker.instance.trackEvent(MarketingEvents.appStarted, {
      type: 'cold',
    });

    initMessaging();
    await initBanners();
    await initRefferal();

    await onUpdatesSync();
    await onAppBackup();
    await Wallet.fetchBalances();
    await initDeepLinks();
    app.checkUpdate();
  } catch (err) {
    Logger.error('onAppStarted', err);
    Logger.captureException(err, 'onAppStarted');
  }
}
