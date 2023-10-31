import {EventEmitter} from 'events';

import {HAQQ_BACKEND} from '@env';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid} from 'react-native';
import {Adjust} from 'react-native-adjust';

import {app} from '@app/contexts';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {getUid} from '@app/helpers/get-uid';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesString} from '@app/models/variables-string';
import {Backend} from '@app/services/backend';
import {AdjustEvents} from '@app/types';
import {IS_ANDROID} from '@app/variables/common';

import {SystemDialog} from './system-dialog';

export enum PushNotificationTopicsEnum {
  news = 'news',
  transactions = 'transactions',
  raffle = 'raffle',
}

export class PushNotifications extends EventEmitter {
  static instance = new PushNotifications();
  path: string = HAQQ_BACKEND;

  constructor() {
    super();

    messaging().onMessage(remoteMessage => {
      Logger.log('onMessage', remoteMessage);
      app.emit(Events.onPushNotification, remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      Logger.log('onNotificationOpenedApp', remoteMessage);
      app.emit(Events.onPushNotification, remoteMessage);
    });
  }

  get isAvailable() {
    return this.path !== '';
  }

  async requestPermissions() {
    if (IS_ANDROID) {
      await SystemDialog.permissionsAndroidRequest(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }

    const authStatus = await SystemDialog.messagingRequestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      const uid = await getUid();
      const subscription = await Backend.instance.createNotificationToken(
        token,
        uid,
      );

      if (subscription) {
        VariablesString.set('notificationToken', subscription.id);
        VariablesBool.set('notifications', true);
      }

      Adjust.setPushToken(token);

      onTrackEvent(AdjustEvents.pushNotifications);
    }
    return enabled;
  }

  async getToken() {
    if (VariablesBool.get('notifications')) {
      return await messaging().getToken();
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
