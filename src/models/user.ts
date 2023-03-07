import {EventEmitter} from 'events';

import {ENVIRONMENT, IS_DEVELOPMENT} from '@env';
import {addMinutes, addSeconds, isAfter, subSeconds} from 'date-fns';
import {AppState, Appearance} from 'react-native';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {generateUUID} from '@app/utils';

import {realm} from './index';
import {AppLanguage, AppTheme} from '../types';
import {
  MAIN_NETWORK,
  PIN_BANNED_ATTEMPTS,
  PIN_BANNED_TIMEOUT_SECONDS,
  SNOOZE_WALLET_BACKUP_MINUTES,
  TEST_NETWORK,
  USER_LAST_ACTIVITY_TIMEOUT_SECONDS,
} from '../variables/common';

export const UserSchema = {
  name: 'User',
  properties: {
    username: 'string',
    language: 'string',
    biometry: 'bool',
    bluetooth: 'bool?',
    onboarded: 'bool?',
    snoozeBackup: 'date?',
    pinAttempts: 'int?',
    pinBanned: 'date?',
    providerId: 'string',
    theme: 'string',
    notifications: 'bool?',
    subscription: 'string?',
    isDeveloper: 'bool?',
    isGoogleSignedIn: 'bool?',
  },
  primaryKey: 'username',
};

export type UserType = {
  username: string;
  language: AppLanguage;
  biometry: boolean;
  snoozeBackup: Date | null;
  pinAttempts: number | null;
  pinBanned: Date | null;
  bluetooth: boolean | null;
  onboarded: boolean | null;
  providerId: string;
  theme: AppTheme;
  notifications: boolean | null;
  subscription: string | null;
  isGoogleSignedIn: boolean | null;
  isDeveloper: boolean | null;
};

export class User extends EventEmitter {
  private last_activity: Date;
  private _raw: UserType & Realm.Object<UserType>;

  constructor(user: UserType & Realm.Object<UserType>) {
    super();
    this.last_activity = new Date();

    this._raw = user;

    this._raw.addListener((obj, changes) => {
      if (changes.changedProperties.length) {
        this.emit('change');

        if (changes.changedProperties.includes('theme')) {
          app.emit('theme', obj.theme);
        }

        if (changes.changedProperties.includes('subscription')) {
          if (obj.subscription) {
            app.emit(Events.onPushSubscriptionAdd);
          }
        }
      }
    });

    this._systemTheme = Appearance.getColorScheme() as AppTheme;

    Appearance.addChangeListener(this.listenTheme);

    AppState.addEventListener('change', this.listenTheme);
  }

  private _systemTheme: AppTheme;

  get systemTheme(): AppTheme {
    return this._systemTheme;
  }

  get uuid() {
    return this._raw.username;
  }

  get isLoaded() {
    return !!this._raw;
  }

  get providerId() {
    return this._raw.providerId;
  }

  set providerId(value) {
    realm.write(() => {
      this._raw.providerId = value;
    });

    this.emit('providerId', value);
  }

  get isDeveloper() {
    return this._raw.isDeveloper;
  }

  set isDeveloper(value) {
    realm.write(() => {
      this._raw.isDeveloper = value;
    });
  }

  get biometry() {
    return this._raw.biometry;
  }

  set biometry(biometry) {
    realm.write(() => {
      this._raw.biometry = biometry;
    });
  }

  get language() {
    return this._raw.language as AppLanguage;
  }

  set language(language) {
    realm.write(() => {
      this._raw.language = language;
    });
  }

  get subscription() {
    return this._raw.subscription;
  }

  set subscription(subscription) {
    realm.write(() => {
      this._raw.subscription = subscription;
    });
  }

  get notifications() {
    return this._raw.notifications;
  }

  get theme(): AppTheme {
    return this._raw.theme;
  }

  set theme(value) {
    realm.write(() => {
      this._raw.theme = value;
    });
  }

  get bluetooth() {
    return this._raw.bluetooth ?? false;
  }

  set bluetooth(value) {
    realm.write(() => {
      this._raw.bluetooth = value;
    });
  }

  get isGoogleSignedIn() {
    return this._raw.isGoogleSignedIn ?? false;
  }

  set isGoogleSignedIn(value) {
    realm.write(() => {
      this._raw.isGoogleSignedIn = value;
    });
  }

  get onboarded() {
    return this._raw.onboarded ?? false;
  }

  set onboarded(value) {
    realm.write(() => {
      this._raw.onboarded = value;
    });
  }

  get snoozeBackup() {
    return this._raw.snoozeBackup;
  }

  get pinBanned() {
    return this._raw.pinBanned;
  }

  get pinAttempts() {
    return this._raw.pinAttempts ?? 0;
  }

  get canEnter() {
    if (this.pinBanned && isAfter(new Date(), this.pinBanned)) {
      realm.write(() => {
        this._raw.pinBanned = null;
      });
    }

    return !this.pinBanned;
  }

  static create() {
    let id = generateUUID();

    realm.write(() => {
      realm.create(UserSchema.name, {
        username: id,
        biometry: false,
        bluetooth: false,
        language: AppLanguage.en,
        theme: IS_DEVELOPMENT === '1' ? AppTheme.system : AppTheme.light,
        isDeveloper: IS_DEVELOPMENT === '1',
        providerId:
          ENVIRONMENT === 'production' || ENVIRONMENT === 'distribution'
            ? MAIN_NETWORK
            : TEST_NETWORK,
      });
    });

    return id;
  }

  static getOrCreate() {
    const users = realm.objects<UserType>('User');

    let id = users.length && users[0].username;

    if (!id) {
      id = User.create();
    }

    return User.getById(id);
  }

  static getById(id: string) {
    const user = realm.objectForPrimaryKey(UserSchema.name, id);
    return new User(user as UserType & Realm.Object<UserType>);
  }

  listenTheme = () => {
    const theme = Appearance.getColorScheme() as AppTheme;

    if (theme !== this._systemTheme) {
      this._systemTheme = theme;

      if (this._raw.theme === AppTheme.system) {
        app.emit('theme');
      }
    }
  };

  successEnter() {
    realm.write(() => {
      this._raw.pinBanned = null;
      this._raw.pinAttempts = 0;
    });
  }

  failureEnter() {
    realm.write(() => {
      this._raw.pinAttempts = this._raw.pinAttempts
        ? Math.min(this._raw.pinAttempts + 1, 8)
        : 1;

      if (this._raw.pinAttempts >= PIN_BANNED_ATTEMPTS) {
        this._raw.pinBanned = addSeconds(
          new Date(),
          5 *
            Math.pow(2, this._raw.pinAttempts - 3) *
            PIN_BANNED_TIMEOUT_SECONDS,
        );
      }
    });
  }

  touchLastActivity() {
    this.last_activity = new Date();
  }

  isOutdatedLastActivity() {
    return (
      this.last_activity <
      subSeconds(new Date(), USER_LAST_ACTIVITY_TIMEOUT_SECONDS)
    );
  }

  setSnoozeBackup() {
    realm.write(() => {
      this._raw.snoozeBackup = addMinutes(
        new Date(),
        SNOOZE_WALLET_BACKUP_MINUTES,
      );
    });
  }
}
