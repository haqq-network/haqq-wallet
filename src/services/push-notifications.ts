import {EventEmitter} from 'events';

import {HAQQ_BACKEND} from '@env';
import messaging from '@react-native-firebase/messaging';

import {app} from '@app/contexts';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesString} from '@app/models/variables-string';
import {AdjustEvents} from '@app/types';
import {getHttpResponse} from '@app/utils';

export enum PushNotificationTopicsEnum {
  news = 'news',
  transactions = 'transactions',
}

export class PushNotifications extends EventEmitter {
  static instance = new PushNotifications();
  path: string = HAQQ_BACKEND;

  constructor() {
    super();

    messaging().onMessage(remoteMessage => {
      console.log('onMessage', remoteMessage);
      app.emit(Events.onPushNotification, remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('onNotificationOpenedApp', remoteMessage);
      app.emit(Events.onPushNotification, remoteMessage);
    });
  }

  get isAvailable() {
    return this.path !== '';
  }

  async requestPermissions() {
    if (!this.isAvailable) {
      throw new Error('push messages unavailable');
    }

    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();

      const subscription = await this.createNotificationToken<{id: string}>(
        token,
      );

      if (subscription) {
        VariablesString.set('notificationToken', subscription.id);
        VariablesBool.set('notifications', true);
      }

      onTrackEvent(AdjustEvents.pushNotifications);
    }
  }

  async hasPermission() {
    if (!this.isAvailable) {
      throw new Error('push messages unavailable');
    }

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

  getPath(subPath: string) {
    if (subPath.startsWith('/')) {
      return `${this.path}${subPath}`;
    }

    return `${this.path}/${subPath}`;
  }

  async createNotificationToken<T extends object>(token: string) {
    const req = await fetch(`${this.path}notification_token`, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        connection: 'keep-alive',
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        token,
      }),
    });

    return await getHttpResponse<T>(req);
  }

  async removeNotificationToken<T extends object>(token_id: string) {
    const req = await fetch(`${this.path}notification_token/${token_id}`, {
      method: 'DELETE',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        connection: 'keep-alive',
        'content-type': 'application/json;charset=UTF-8',
      },
    });

    return await getHttpResponse<T>(req);
  }

  async createNotificationSubscription<T extends object>(
    token_id: string,
    address: string,
  ) {
    const req = await fetch(`${this.path}notification_subscription`, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        connection: 'keep-alive',
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        token_id,
        address,
      }),
    });

    return await getHttpResponse<T>(req);
  }

  async unsubscribeByTokenAndAddress<T extends object>(
    token_id: string,
    address: string,
  ) {
    const req = await fetch(
      `${this.path}notification_subscription/${token_id}/${address}`,
      {
        method: 'DELETE',
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
          connection: 'keep-alive',
          'content-type': 'application/json;charset=UTF-8',
        },
      },
    );

    return await getHttpResponse<T>(req);
  }

  async unsubscribeByToken<T extends object>(token_id: string) {
    const req = await fetch(
      `${this.path}notification_subscription/${token_id}`,
      {
        method: 'DELETE',
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
          connection: 'keep-alive',
          'content-type': 'application/json;charset=UTF-8',
        },
      },
    );

    return await getHttpResponse<T>(req);
  }
}
