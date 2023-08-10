import {tryToInitBt} from '@haqq/provider-ledger-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid} from 'react-native';

import {
  requestCameraPermissions,
  requestTrackingAuthorization,
} from '@app/utils';

import {AppNativeConfig, BooleanConfigKey} from './app-native-config';

const logger = Logger.create('SystemDialogService');

const SYSTEM_DIALOG_DISABLE_TIMEOUT_MS = 5000;

class SystemDialogService {
  private _timeoutId: NodeJS.Timeout;

  tryToInitBt = () => this.getResult(tryToInitBt);

  requestCameraPermissions = () => this.getResult(requestCameraPermissions);

  messagingRequestPermission = () =>
    this.getResult(function requestPermission() {
      return messaging().requestPermission();
    });

  permissionsAndroidRequest: typeof PermissionsAndroid.request = (...args) =>
    this.getResult(PermissionsAndroid.request, ...args);

  requestTrackingAuthorization = () =>
    this.getResult(requestTrackingAuthorization);

  getClipboardString = () => this.getResult(Clipboard.getString);

  getResult = async <Fn extends (...args: any) => Promise<any>>(
    callback: Fn,
    ...args: Parameters<Fn>
    // @ts-ignore
  ): ReturnType<Fn> => {
    try {
      logger.log('call function:', callback.name, 'args:', args);
      if (this._timeoutId) {
        clearTimeout(this._timeoutId);
      }
      this.setSystemDialogEnabled(true);
      // @ts-ignore
      return await callback(...args);
    } catch (error) {
      logger.error('getResult error', error);
      throw error;
    } finally {
      this.setSystemDialogEnabled(false);
    }
  };

  private setSystemDialogEnabled = (value: boolean) => {
    const action = () =>
      AppNativeConfig.setBoolean(BooleanConfigKey.systemDialogEnabled, value);

    if (value) {
      action();
    } else {
      this._timeoutId = setTimeout(action, SYSTEM_DIALOG_DISABLE_TIMEOUT_MS);
    }
  };
}

export const SystemDialog = new SystemDialogService();
