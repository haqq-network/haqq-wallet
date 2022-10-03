import {addMinutes, subMinutes} from 'date-fns';
import {realm} from './index';
import {SNOOZE_WALLET_BACKUP_MINUTES} from '../variables';

export const UserSchema = {
  name: 'User',
  properties: {
    username: 'string',
    language: 'string',
    biometry: 'bool',
    snoozeBackup: 'date?',
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

  touchLastActivity() {
    this.last_activity = new Date();
  }

  isOutdatedLastActivity() {
    return this.last_activity < subMinutes(new Date(), 15);
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
