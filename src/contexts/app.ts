import {createContext} from 'react';

import {EventEmitter} from 'events';

import {appleAuth} from '@invertase/react-native-apple-authentication';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {subMinutes} from 'date-fns';
import {AppState, Platform} from 'react-native';
import Keychain, {
  STORAGE_TYPE,
  getGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';
import TouchID from 'react-native-touch-id';

import {DEBUG_VARS} from '@app/debug-vars';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {migration} from '@app/models/migration';
import {EthNetwork} from '@app/services';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {captureException, showModal} from '../helpers';
import {Provider} from '../models/provider';
import {User} from '../models/user';
import {AppLanguage, AppTheme, BiometryType, DynamicLink} from '../types';
import {LIGHT_GRAPHIC_GREEN_1} from '../variables/common';

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
  private authenticated: boolean = DEBUG_VARS.enableSkipPinOnLogin;
  private appStatus: AppStatus = AppStatus.inactive;
  private _lastTheme: AppTheme = AppTheme.light;
  private _balance: Map<string, number> = new Map();
  private _googleSigninSupported: boolean = false;
  private _appleSigninSupported: boolean =
    Platform.select({
      android: false,
      ios: appleAuth.isSupported,
    }) || false;

  constructor() {
    super();

    migration();

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

    GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: false}).then(
      (result: boolean) => {
        this._googleSigninSupported = result;
      },
    );

    this.user = User.getOrCreate();

    this._provider = Provider.getProvider(this.user.providerId);

    if (this._provider) {
      EthNetwork.init(this._provider);
    }

    this.user.on('providerId', providerId => {
      const p = Provider.getProvider(providerId);
      if (p) {
        this._provider = p;
        EthNetwork.init(p);
        app.emit(Events.onProviderChanged);
      }
    });

    this.on(Events.onWalletsBalance, this.onWalletsBalance.bind(this));
    this.checkBalance = this.checkBalance.bind(this);
    this.checkBalance();
    setInterval(this.checkBalance, 6000);

    this.handleDynamicLink = this.handleDynamicLink.bind(this);

    dynamicLinks().onLink(this.handleDynamicLink);
    dynamicLinks().getInitialLink().then(this.handleDynamicLink);
  }

  private _biometryType: BiometryType | null = null;

  get biometryType() {
    return this._biometryType;
  }

  get isGoogleSigninSupported() {
    return this._googleSigninSupported;
  }

  get isAppleSigninSupported() {
    return this._appleSigninSupported;
  }

  get isOathSigninSupported() {
    return (
      this._googleSigninSupported ||
      this._appleSigninSupported ||
      this.isDeveloper
    );
  }

  private _provider: Provider | null;

  get provider() {
    return this._provider;
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

  get isUnlocked() {
    return this.authenticated || false;
  }

  get bluetooth() {
    return this.user?.bluetooth || false;
  }

  set bluetooth(value) {
    if (this.user) {
      this.user.bluetooth = value;
    }
  }

  get notifications() {
    return this.user.notifications && this.user.subscription;
  }

  get snoozeBackup(): Date {
    return this.user?.snoozeBackup || subMinutes(new Date(), 1);
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

  get isDeveloper() {
    return this.user.isDeveloper ?? false;
  }

  async init(): Promise<void> {
    if (!this.user.onboarded) {
      return Promise.resolve();
    }

    await this.auth();

    await awaitForEventDone(Events.onWalletsBalanceCheck);

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

  async auth() {
    const close = showModal('pin');
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
    console.log('this.authenticated', this.authenticated);
    if (this.authenticated) {
      close();
    }
  }

  biometryAuth() {
    return TouchID.authenticate('', optionalConfigObject);
  }

  pinAuth() {
    return new Promise<void>(async (resolve, _reject) => {
      const password = await this.getPassword();

      const callback = (value: string) => {
        if (password === value) {
          this.off('enterPin', callback);
          resolve();
        } else {
          this.emit('errorPin', 'not match');
        }
      };

      this.on('enterPin', callback);
    });
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
          if (this.user?.isOutdatedLastActivity() && this.authenticated) {
            this.authenticated = false;
            await this.auth();
          }
          await awaitForEventDone(Events.onAppActive);
          break;
        case AppStatus.inactive:
          if (this.authenticated) {
            this.user?.touchLastActivity();
          }
          break;
      }

      this.appStatus = appStatus;
    }
  }

  checkBalance() {
    if (AppState.currentState === 'active') {
      this.emit(Events.onWalletsBalanceCheck);
    }
  }

  onWalletsBalance(balance: Record<string, number>) {
    let changed = false;
    for (const entry of Object.entries(balance)) {
      if (this._balance.get(entry[0]) !== entry[1]) {
        this._balance.set(entry[0], entry[1]);
        changed = true;
      }
    }

    if (changed) {
      this.emit('balance');
    }
  }

  getBalance(address: string) {
    return this._balance.get(address) ?? 0;
  }

  handleDynamicLink(link: DynamicLink | null) {
    this.emit(Events.onDynamicLink, link);
  }
}

export type AppType = typeof App;

export const app = new App();

export const AppContext = createContext(app);
