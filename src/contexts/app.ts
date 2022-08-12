import {EventEmitter} from 'events';
import {
  getGenericPassword,
  resetGenericPassword,
  setGenericPassword,
  STORAGE_TYPE,
} from 'react-native-keychain';
import TouchID from 'react-native-touch-id';
import {createContext, useContext} from 'react';
import {realm} from '../models';
import {User} from '../models/user';
import Keychain from 'react-native-keychain';

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  color: '#e00606', // Android,
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
};

class App extends EventEmitter {
  password: string | null = null;
  loaded: boolean = false;
  private user: User & Realm.Object;
  authentificated: boolean = false;

  async init(): Promise<string> {
    const creds = await getGenericPassword();

    if (!creds || !creds.password) {
      return 'login';
    }

    this.password = creds.password;

    this.user = await this.loadUser(creds.username);
    console.log('user', this.user);
    if (!this.user) {
      return 'login';
    }

    if (this.user.biometry && !this.authentificated) {
      try {
        console.log('biometry');
        await this.biometryAuth();
        this.authentificated = true;
      } catch (error) {
        console.log(error);
      }
    }

    if (this.password && !this.authentificated) {
      console.log('show pin');
      return 'pin';
    }

    this.authentificated = true;

    return 'home';
  }

  getPassword() {
    return this.password!;
  }

  async loadUser(username: string = 'username') {
    const users = await realm.objects<User>('User');
    const filtered = users.filtered(`username = '${username}'`);

    return filtered[0];
  }

  async setPassword(password: string) {
    this.password = password;
    await setGenericPassword('username', this.password, {
      storage: STORAGE_TYPE.AES,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async clean() {
    this.password = null;
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

  async setPin(pin: string) {
    this.password = pin;
    await setGenericPassword('username', this.password, {
      storage: STORAGE_TYPE.AES,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  comparePin(pin: string) {
    return this.password === pin;
  }

  get biometry() {
    return this.user.biometry;
  }

  set biometry(value) {
    realm.write(() => {
      this.user.biometry = value;
    });
  }

  biometryAuth() {
    return TouchID.authenticate(
      'to demo this react-native component',
      optionalConfigObject,
    );
  }
}

export const app = new App();

export const AppContext = createContext(app);

export function useApp() {
  const context = useContext(AppContext);

  return context;
}
