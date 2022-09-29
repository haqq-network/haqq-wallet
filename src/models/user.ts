import {subMinutes} from 'date-fns';

export const UserSchema = {
  name: 'User',
  properties: {
    username: 'string',
    language: 'string',
    biometry: 'bool',
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

  get language() {
    return this._raw.language as Language;
  }

  touchLastActivity() {
    this.last_activity = new Date();
  }

  isOutdatedLastActivity() {
    return this.last_activity < subMinutes(new Date(), 15);
  }
}
