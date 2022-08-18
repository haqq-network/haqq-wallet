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
import {User, UserType} from '../models/user';
import {AppState} from 'react-native';

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  color: '#e00606', // Android,
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
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

  async init(): Promise<void> {
    this.user = await this.loadUser('username');
    console.log('user', JSON.stringify(this.user));
    if (!this.user.isLoaded) {
      return Promise.reject();
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

  async loadUser(username: string = 'username') {
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
      });
    });

    this.user = await this.loadUser(username);
  }

  async removeUser() {
    realm.write(() => {
      realm.delete(this.user?.raw);
    });
  }

  async setPin(password: string) {
    await setGenericPassword('username', password, {
      storage: STORAGE_TYPE.AES,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async comparePin(pin: string) {
    const password = await this.getPassword();
    return password === pin ? Promise.resolve() : Promise.reject();
  }

  get biometry() {
    return this.user?.biometry || false;
  }

  set biometry(value) {
    realm.write(() => {
      if (this.user) {
        this.user.raw.biometry = value;
      }
    });
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
      'to demo this react-native component',
      optionalConfigObject,
    );
  }

  pinAuth() {
    return new Promise<void>(async (resolve, _reject) => {
      this.emit('showPin', true);
      const password = await this.getPassword();

      const callback = (value: string) => {
        if (password === value) {
          this.off('enterPin', callback);
          this.emit('showPin', false);
          resolve();
        } else {
          this.emit('errorPin', 'not match');
        }
      };

      this.on('enterPin', callback);
    });
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
}

export const app = new App();

export const AppContext = createContext(app);

export function useApp() {
  const context = useContext(AppContext);

  return context;
}
