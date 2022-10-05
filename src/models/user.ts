import {addMinutes, addSeconds, isAfter, isBefore} from 'date-fns';
import {realm} from './index';
import {
  PIN_BANNED_ATTEMPTS,
  PIN_BANNED_TIMEOUT_SECONDS,
  SNOOZE_WALLET_BACKUP_MINUTES,
  USER_LAST_ACTIVITY_TIMEOUT_SECONDS,
} from '../variables';

export const UserSchema = {
  name: 'User',
  properties: {
    username: 'string',
    language: 'string',
    biometry: 'bool',
    snoozeBackup: 'date?',
    pinAttempts: 'int?',
    pinBanned: 'date?',
  },
  primaryKey: 'username',
};

export enum Language {
  en = 'en',
  ar = 'ar',
}

export type UserType = {
  username: string;
  language: Language;
  biometry: boolean;
  snoozeBackup: Date | null;
  pinAttempts: number | null;
  pinBanned: Date | null;
};

export class User {
  private last_activity: Date;
  private _raw: UserType & Realm.Object;

  constructor(user: UserType & Realm.Object) {
    this.last_activity = new Date();

    this._raw = user;
  }

  get isLoaded() {
    return !!this._raw;
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
    return this._raw.language as Language;
  }

  set language(language) {
    realm.write(() => {
      this._raw.language = language;
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
    console.log('canEnter', this.pinAttempts, PIN_BANNED_ATTEMPTS);
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

      console.log('this._raw.pinAttempts', this._raw.pinAttempts);

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
      addSeconds(new Date(), USER_LAST_ACTIVITY_TIMEOUT_SECONDS)
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
