import {createContext} from 'react';

import {EventEmitter} from 'events';

import {ENVIRONMENT, IS_DEVELOPMENT} from '@env';
import {subMinutes} from 'date-fns';
import {AppState, Platform} from 'react-native';
import Keychain, {
  STORAGE_TYPE,
  getGenericPassword,
  resetGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';
import TouchID from 'react-native-touch-id';

import {EthNetwork} from '@app/services';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {captureException} from '../helpers';
import {realm} from '../models';
import {Provider} from '../models/provider';
import {User, UserType} from '../models/user';
import {AppLanguage, AppTheme, BiometryType} from '../types';
import {generateUUID} from '../utils';
import {LIGHT_GRAPHIC_GREEN_1, MAIN_NETWORK, TEST_NETWORK} from '../variables';

const optionalConfigObject = {
  title: 'Fingerprint Login', // Android
  imageColor: LIGHT_GRAPHIC_GREEN_1,
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
};

const isSupportedConfig = {
  unifiedErrors: false,
};

enum AppStatus {
  inactive,
  active,
}

function getAppStatus() {
  return AppState.currentState === 'active'
    ? AppStatus.active
    : AppStatus.inactive;
}

class App extends EventEmitter {
  private user: User;
  private authenticated: boolean = false;
  private appStatus: AppStatus = AppStatus.inactive;
  private _biometryType: BiometryType | null = null;
  private _lastTheme: AppTheme = AppTheme.light;
  private _provider: Provider | undefined;

  constructor() {
    super();

    TouchID.isSupported(isSupportedConfig)
      .then(biometryType => {
        this._biometryType =
          Platform.select({
            ios: biometryType as BiometryType,
            android: biometryType ? BiometryType.fingerprint : null,
          }) || null;
      })
      .catch(() => {
        this._biometryType = null;
      });

    this.user = this.loadUser();

    this._provider = Provider.getProvider(this.user.providerId);

    if (this._provider) {
      EthNetwork.init(this._provider);
    }

    this.user.on('providerId', providerId => {
      const p = Provider.getProvider(providerId);
      if (p) {
        this._provider = p;
        EthNetwork.init(p);
      }
    });
  }

  async init(): Promise<void> {
    try {
      await this.getPassword();
    } catch (e) {
      console.log(e);
      return Promise.reject('user_not_found');
    }
    await this.auth();

    this.authenticated = true;

    this.appStatus = getAppStatus();

    AppState.addEventListener('change', this.onAppStatusChanged.bind(this));

    return Promise.resolve();
  }

  async getPassword() {
    const creds = await getGenericPassword();
    if (!creds || !creds.password || creds.username !== this.user.uuid) {
      return Promise.reject('password_not_found');
    }

    return creds.password;
  }

  loadUser(): User {
    const users = realm.objects<UserType>('User');

    if (!users.length) {
      realm.write(() => {
        realm.create('User', {
          username: generateUUID(),
          biometry: false,
          bluetooth: false,
          language: AppLanguage.en,
          theme: IS_DEVELOPMENT === '1' ? AppTheme.system : AppTheme.light,
          providerId:
            ENVIRONMENT === 'production' || ENVIRONMENT === 'distribution'
              ? MAIN_NETWORK
              : TEST_NETWORK,
        });
      });
    }

    return new User(users[0] as UserType & Realm.Object<UserType>);
  }

  async clean() {
    await resetGenericPassword();
  }

  async setPin(password: string) {
    await setGenericPassword(this.user.uuid, password, {
      storage: STORAGE_TYPE.AES,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async updatePin(pin: string) {
    await setGenericPassword(this.user.uuid, pin, {
      storage: STORAGE_TYPE.AES,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async comparePin(pin: string) {
    if (this.canEnter) {
      const password = await this.getPassword();
      return password === pin ? Promise.resolve() : Promise.reject();
    }

    return Promise.reject();
  }

  get provider() {
    return this._provider;
  }

  get biometryType() {
    return this._biometryType;
  }

  get biometry() {
    return this.user?.biometry || false;
  }

  set biometry(value) {
    if (this.user) {
      this.user.biometry = value;
    }
  }

  get language() {
    return this.user?.language || AppLanguage.en;
  }

  set language(value) {
    if (this.user) {
      this.user.language = value;
    }
  }

  get bluetooth() {
    return this.user?.bluetooth || false;
  }

  set bluetooth(value) {
    if (this.user) {
      this.user.bluetooth = value;
    }
  }

  get snoozeBackup(): Date {
    return this.user?.snoozeBackup || subMinutes(new Date(), 1);
  }

  async auth() {
    if (this.biometry) {
      try {
        await this.biometryAuth();
        vibrate(HapticEffects.success);
        this.authenticated = true;
      } catch (error) {
        console.log(error);
      }
    }

    if (!this.authenticated) {
      await this.pinAuth();
      this.authenticated = true;
    }
  }

  biometryAuth() {
    return TouchID.authenticate('', optionalConfigObject);
  }

  pinAuth() {
    return new Promise<void>(async (resolve, _reject) => {
      this.emit('modal', {type: 'pin'});
      const password = await this.getPassword();

      const callback = (value: string) => {
        if (password === value) {
          this.off('enterPin', callback);
          this.emit('modal', {type: 'splash'});
          resolve();
        } else {
          this.emit('errorPin', 'not match');
        }
      };

      this.on('enterPin', callback);
    });
  }

  get canEnter() {
    return this.user?.canEnter;
  }

  get pinBanned() {
    return this.user?.pinBanned;
  }

  get pinAttempts() {
    return this.user?.pinAttempts ?? 0;
  }

  successEnter() {
    return this.user?.successEnter();
  }

  failureEnter() {
    return this.user?.failureEnter();
  }

  getUser() {
    return this.user;
  }

  getTheme() {
    try {
      if (this.user) {
        this._lastTheme =
          this.user.theme === AppTheme.system
            ? this.user.systemTheme
            : this.user.theme;
      }
    } catch (e) {
      captureException(e, 'app.getTheme');
    } finally {
      return this._lastTheme;
    }
  }

  async onAppStatusChanged() {
    const appStatus = getAppStatus();
    if (this.appStatus !== appStatus) {
      switch (appStatus) {
        case AppStatus.active:
          if (this.user?.isOutdatedLastActivity()) {
            this.authenticated = false;
            await this.auth();
          }
          break;
        case AppStatus.inactive:
          this.user?.touchLastActivity();
          break;
      }

      this.appStatus = appStatus;
    }
  }

  setSnoozeBackup() {
    return this.user?.setSnoozeBackup();
  }
}

export const app = new App();

export const AppContext = createContext(app);
