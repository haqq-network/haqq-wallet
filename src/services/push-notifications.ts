import {EventEmitter} from 'events';

import {PUSH_NOTIFICATIONS_URL} from '@env';
import {jsonrpcRequest} from '@haqq/shared-react-native';
import messaging from '@react-native-firebase/messaging';

import {app} from '@app/contexts';

export class PushNotifications extends EventEmitter {
  static instance = new PushNotifications();
  path: string = PUSH_NOTIFICATIONS_URL;

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

  createNotificationToken<T extends object>(token: string) {
    return jsonrpcRequest<T>(this.path, 'createNotificationToken', [token]);
  }

  async removeNotificationToken<T extends object>(token: string) {
    return jsonrpcRequest<T>(this.path, 'removeNotificationToken', [token]);
  }

  async createNotificationSubscription<T extends object>(
    token_id: string,
    address: string,
  ) {
    return jsonrpcRequest<T>(this.path, 'createNotificationSubscription', [
      token_id,
      address,
    ]);
  }

  async unsubscribeAddress<T extends object>(
    token_id: string,
    address: string,
  ) {
    return jsonrpcRequest<T>(this.path, 'unsubscribeAddress', [
      token_id,
      address,
    ]);
  }
}
