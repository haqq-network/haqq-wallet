import {EventEmitter} from 'events';

import {PUSH_NOTIFICATIONS} from '@env';
import messaging from '@react-native-firebase/messaging';

import {app} from '@app/contexts';
import {PushNotificationsEvents} from '@app/events';

class PushNotifications extends EventEmitter<PushNotificationsEvents> {
  path: string = PUSH_NOTIFICATIONS;
  last_id = 0;

  constructor() {
    super();
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
      const subscription = await this.createNotificationToken(token);

      if (subscription) {
        app.getUser().subscription = subscription.id;
      }
    }
  }

  getPath(subPath: string) {
    if (subPath.startsWith('/')) {
      return `${this.path}${subPath}`;
    }

    return `${this.path}/${subPath}`;
  }

  async postQuery<T>(path: string, data: string): Promise<T> {
    console.log('postQuery', this.getPath(path), data);
    const resp = await fetch(this.getPath(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json, text/plain, */*',
        Accept: 'application/json;charset=UTF-8',
      },
      body: data,
    });

    return await resp.json();
  }

  async jsonRpcRequest<T>(
    path: string,
    method: string,
    ...params: string[]
  ): Promise<T | undefined> {
    this.last_id += 1;

    const response = await this.postQuery<{
      id: string;
      result: T;
      error: null | {code: number; message: string; data: any};
    }>(
      '/',
      JSON.stringify({
        jsonrpc: '2.0',
        id: String(this.last_id),
        method,
        params,
      }),
    );

    console.log('response', response);

    if (response.id !== String(this.last_id)) {
      throw new Error('wrong response');
    }

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (response) {
      return response.result;
    }
  }

  createNotificationToken<T = {id: string}>(
    token: string,
  ): Promise<T | undefined> {
    return this.jsonRpcRequest<T>('/', 'createNotificationToken', token);
  }

  async removeNotificationToken(token: string): Promise<void> {
    return this.jsonRpcRequest<void>('/', 'removeNotificationToken', token);
  }

  async createNotificationSubscription(
    token_id: string,
    address: string,
  ): Promise<void> {
    return this.jsonRpcRequest<void>(
      '/',
      'createNotificationSubscription',
      token_id,
      address,
    );
  }

  async unsubscribeAddress(token_id: string, address: string): Promise<void> {
    return this.jsonRpcRequest<void>(
      '/',
      'unsubscribeAddress',
      token_id,
      address,
    );
  }
}

export const pushNotifications = new PushNotifications();
