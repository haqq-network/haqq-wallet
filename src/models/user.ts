import {EventEmitter} from 'events';

import {addMinutes, addSeconds, isAfter, subSeconds} from 'date-fns';
import {AppState, Appearance} from 'react-native';

import {app} from '@app/contexts';
import {Events} from '@app/events';

import {AppLanguage, AppTheme} from '../types';
import {
  PIN_BANNED_ATTEMPTS,
  PIN_BANNED_TIMEOUT_SECONDS,
  SNOOZE_WALLET_BACKUP_MINUTES,
  USER_LAST_ACTIVITY_TIMEOUT_SECONDS,
} from '../variables';
import {realm} from './index';

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
};

export class User extends EventEmitter {
  private last_activity: Date;
  private _raw: UserType & Realm.Object<UserType>;
  private _systemTheme: AppTheme;

  constructor(user: UserType & Realm.Object<UserType>) {
    super();
    this.last_activity = new Date();

    this._raw = user;

    console.log('user', this._raw.toJSON());

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

  listenTheme = () => {
    const theme = Appearance.getColorScheme() as AppTheme;

    if (theme !== this._systemTheme) {
      this._systemTheme = theme;

      if (this._raw.theme === AppTheme.system) {
        app.emit('theme');
      }
    }
  };

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

  set subscription(subscription) {
    realm.write(() => {
      this._raw.subscription = subscription;
    });
  }

  get subscription() {
    return this._raw.subscription;
  }

  get notifications() {
    return this._raw.notifications;
  }

  get theme(): AppTheme {
    return this._raw.theme;
  }

  get systemTheme(): AppTheme {
    return this._systemTheme;
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
        this._raw.pinAttempts = 0;
      });
    }

    return this.pinAttempts < PIN_BANNED_ATTEMPTS;
  }

  successEnter() {
    realm.write(() => {
      this._raw.pinBanned = null;
      this._raw.pinAttempts = 0;
    });
  }

  failureEnter() {
    realm.write(() => {
      this._raw.pinAttempts = this._raw.pinAttempts
        ? this._raw.pinAttempts + 1
        : 1;

      if (this._raw.pinAttempts === PIN_BANNED_ATTEMPTS) {
        this._raw.pinBanned = addSeconds(
          new Date(),
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
