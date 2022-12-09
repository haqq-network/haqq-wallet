import {EventEmitter} from 'events';

import {PUSH_NOTIFICATIONS} from '@env';
import messaging from '@react-native-firebase/messaging';

import {app} from '@app/contexts';

class PushNotifications extends EventEmitter {
  path: string = PUSH_NOTIFICATIONS;
  last_id = 0;

  constructor() {
    super();
  }

  get isAvailable() {
    return this.path !== '';
  }

  async requestPermissions() {
    console.log('requestPermissions', this.isAvailable, this.path);
    if (!this.isAvailable) {
      throw new Error('push messages unavailable');
    }
    console.log('w');
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);

      const token = await messaging().getToken();
      console.log('token', token);
      const subscription = await this.createNotificationToken(token);
      console.log('subscription', subscription);
      app.getUser().subscription = subscription;
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
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: data,
    });
    console.log('resp', resp);
    return await resp.json();
  }

  async jsonRpcRequest<T>(
    path: string,
    method: string,
    ...params: string[]
  ): Promise<T> {
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

  createNotificationToken(token: string): Promise<string> {
    return this.jsonRpcRequest<string>('/', 'createNotificationToken', token);
  }

  async removeNotificationToken(token: string): Promise<void> {
    return this.jsonRpcRequest<void>('/', 'removeNotificationToken', token);
  }

  async subscribeAddress(token_id: string, address: string): Promise<void> {
    return this.jsonRpcRequest<void>(
      '/',
      'subscribeAddress',
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
