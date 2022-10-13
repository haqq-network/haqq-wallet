import {EventEmitter} from 'events';
import Keychain, {
  getGenericPassword,
  resetGenericPassword,
  setGenericPassword,
  STORAGE_TYPE,
} from 'react-native-keychain';
import TouchID from 'react-native-touch-id';
import {createContext, useContext} from 'react';
import {realm} from '../models';
import {Language, User, UserType} from '../models/user';
import {AppState, Platform} from 'react-native';
import {BiometryType} from '../types';
import {subMinutes} from 'date-fns';
import {BIOMETRY_TYPES_NAMES} from '../variables';

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  color: '#e00606', // Android,
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
  private user: User | undefined;
  private authenticated: boolean = false;
  private appStatus: AppStatus = AppStatus.inactive;
  private _biometryType: BiometryType | null = null;

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

    this.user = this.loadUser('username');
  }

  async init(): Promise<void> {
    if (!this.user?.isLoaded) {
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

    if (!creds || !creds.password) {
      return Promise.reject();
    }

    return creds.password;
  }

  loadUser(username: string = 'username'): User {
    const users = realm.objects<UserType>('User');
    const filtered = users.filtered(`username = '${username}'`);

    return new User(filtered[0]);
  }

  async clean() {
    await resetGenericPassword();
    await this.removeUser();
  }

  async createUser(username: string = 'username') {
    realm.write(() => {
      realm.create('User', {
        username,
        pin: '',
        biometry: false,
        language: 'en',
      });
    });

    this.user = await this.loadUser(username);
  }

  async removeUser() {
    this.user = undefined;

    const users = realm.objects<User>('User');

    for (const user of users) {
      realm.write(() => {
        realm.delete(user);
      });
    }
  }

  async setPin(password: string) {
    await setGenericPassword('username', password, {
      storage: STORAGE_TYPE.AES,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async updatePin(pin: string) {
    await setGenericPassword('username', pin, {
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
    return this.user?.language || Language.en;
  }

  set language(value) {
    if (this.user) {
      this.user.language = value;
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
    return TouchID.authenticate(
      `${
        BIOMETRY_TYPES_NAMES[this.biometryType ?? BiometryType.unknown]
      } required to continue`,
      optionalConfigObject,
    );
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
