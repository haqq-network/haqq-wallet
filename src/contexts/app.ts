import {createContext, useContext, useEffect, useState} from 'react';

import {EventEmitter} from 'events';

import {ENVIRONMENT} from '@env';
import {subMinutes} from 'date-fns';
import {AppState, Platform} from 'react-native';
import Keychain, {
  STORAGE_TYPE,
  getGenericPassword,
  resetGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';
import TouchID from 'react-native-touch-id';

import {realm} from '../models';
import {Provider} from '../models/provider';
import {User, UserType} from '../models/user';
import {EthNetwork} from '../services/eth-network';
import {AppLanguage, AppTheme, BiometryType} from '../types';
import {generateUUID} from '../utils';
import {LIGHT_GRAPHIC_GREEN_1, MAIN_NETWORK, TEST_NETWORK} from '../variables';

type OptionalConfigObjectT = {
  title: string;
  imageColor: string;
  fallbackLabel: string;
};

const optionalConfigObject: OptionalConfigObjectT = {
  title: 'Fingerprint Login', // Android
  imageColor: LIGHT_GRAPHIC_GREEN_1,
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
  // unifiedErrors: false,
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

  constructor() {
    super();

    TouchID.isSupported(optionalConfigObject)
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

    const provider = Provider.getProvider(this.user.providerId);

    if (provider) {
      EthNetwork.init(provider);
    }

    this.user.on('providerId', providerId => {
      const p = Provider.getProvider(providerId);
      if (p) {
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
          language: 'en',
          providerId:
            ENVIRONMENT === 'production' || ENVIRONMENT === 'distribution'
              ? MAIN_NETWORK
              : TEST_NETWORK,
        });
      });
    }

    return new User(users[0]);
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
    if (this.user) {
      this._lastTheme =
        this.user.theme === AppTheme.system
          ? this.user.systemTheme
          : this.user.theme;
    }

    return this._lastTheme;
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

export function useApp() {
  const context = useContext(AppContext);

  return context;
}

export function useUser() {
  const user = app.getUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setDate] = useState(new Date());
  useEffect(() => {
    const subscription = () => {
      setDate(new Date());
    };

    user.on('change', subscription);

    return () => {
      user.removeListener('change', subscription);
    };
  }, [user]);

  return user;
}
