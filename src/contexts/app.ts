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
import {User} from '../models/user';

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  color: '#e00606', // Android,
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
};

class App extends EventEmitter {
  private user: User & Realm.Object;
  private authenticated: boolean = false;

  async init(): Promise<void> {
    this.user = await this.loadUser('username');
    console.log('user', this.user);
    if (!this.user) {
      return Promise.reject();
    }

    await this.auth();

    this.authenticated = true;

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
    const users = realm.objects<User>('User');
    const filtered = users.filtered(`username = '${username}'`);

    return filtered[0];
  }

  async setPassword(password: string) {
    await setGenericPassword('username', password, {
      storage: STORAGE_TYPE.AES,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
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

    this.user = this.loadUser(username);
  }

  async removeUser() {
    realm.write(() => {
      realm.delete(this.user);
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
    return this.user.biometry;
  }

  set biometry(value) {
    realm.write(() => {
      this.user.biometry = value;
    });
  }

  async auth() {
    if (this.user.biometry) {
      try {
        console.log('biometry');
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
    return new Promise<void>(async (resolve, reject) => {
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
}

export const app = new App();

export const AppContext = createContext(app);

export function useApp() {
  const context = useContext(AppContext);

  return context;
}
