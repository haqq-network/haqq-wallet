import {EventEmitter} from 'events';

import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid} from 'react-native';
import Config from 'react-native-config';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {getUid} from '@app/helpers/get-uid';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesString} from '@app/models/variables-string';
import {Backend} from '@app/services/backend';
import {MarketingEvents} from '@app/types';
import {IS_ANDROID} from '@app/variables/common';

import {EventTracker} from './event-tracker';

export enum PushNotificationTopicsEnum {
  news = 'news',
  transactions = 'transactions',
  raffle = 'raffle',
}

export class PushNotifications extends EventEmitter {
  static instance = new PushNotifications();
  path: string = Config.HAQQ_BACKEND;

  constructor() {
    super();

    messaging().onMessage(remoteMessage => {
      // Logger.log('onMessage', remoteMessage);
      app.emit(Events.onPushNotification, remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      // Logger.log('onNotificationOpenedApp', remoteMessage);
      app.emit(Events.onPushNotification, remoteMessage);
    });

    messaging().onTokenRefresh(token => {
      if (token) {
        app.emit(Events.onPushTokenRefresh, token);
      }
    });
  }

  get isAvailable() {
    return this.path !== '';
  }

  async requestPermissions() {
    if (IS_ANDROID) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }

    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await this.getToken(true);
      if (!token) {
        return;
      }
      const uid = await getUid();
      const subscription = await Backend.instance.createNotificationToken(
        token,
        uid,
      );

      if (subscription) {
        VariablesString.set('notificationToken', subscription.id);
        VariablesBool.set('notifications', true);
      }

      EventTracker.instance.setPushToken(token);
      EventTracker.instance.trackEvent(MarketingEvents.pushNotifications);
    }
    return enabled;
  }

  async getToken(force: boolean = false) {
    if (VariablesBool.get('notifications') || force) {
      try {
        const token = await messaging().getToken();
        return token;
      } catch (err) {
        Logger.log('PushNotifications:getToken', err);
        return null;
      }
    }

    return null;
  }

  async hasPermission() {
    const authStatus = await messaging().hasPermission();

    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  async hasPermissionsBlocked() {
    const authStatus = await messaging().hasPermission();

    return authStatus === messaging.AuthorizationStatus.DENIED;
  }

  async subscribeToTopic(topic: string) {
    if (!this.isAvailable) {
      throw new Error('push messages unavailable');
    }

    await messaging().subscribeToTopic(topic);
  }

  async unsubscribeFromTopic(topic: string) {
    if (!this.isAvailable) {
      throw new Error('push messages unavailable');
    }

    await messaging().unsubscribeFromTopic(topic);
  }
}
