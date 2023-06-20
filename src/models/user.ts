import {EventEmitter} from 'events';

import {ENVIRONMENT, IS_DEVELOPMENT} from '@env';
import {addSeconds, isAfter, subSeconds} from 'date-fns';

import {awaitForRealm} from '@app/helpers/await-for-realm';
import {generateUUID} from '@app/utils';

import {realm} from './index';
import {AppLanguage, AppTheme} from '../types';
import {
  MAIN_NETWORK,
  PIN_BANNED_ATTEMPTS,
  PIN_BANNED_TIMEOUT_SECONDS,
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
    isDeveloper: {type: 'bool', default: false},
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
      }
    });
  }

  get uuid() {
    return this._raw.username;
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
        theme: AppTheme.system,
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

  async resetUserData() {
    await awaitForRealm();
    realm.write(() => {
      this._raw.onboarded = false;
      this._raw.pinAttempts = null;
      this._raw.pinBanned = null;
    });
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
}
