import {addMinutes} from 'date-fns';

export const UserSchema = {
  name: 'User',
  properties: {
    username: 'string',
    biometry: 'bool',
  },
  primaryKey: 'username',
};

export type UserType = {
  username: string;
  biometry: boolean;
};

export class User {
  private last_activity: Date;
  raw: UserType & Realm.Object;

  constructor(user: UserType & Realm.Object) {
    this.last_activity = new Date();

    this.raw = user;
  }

  get isLoaded() {
    return !!this.raw;
  }

  get biometry() {
    return this.raw.biometry;
  }

  touchLastActivity() {
    this.last_activity = new Date();
  }

  isOutdatedLastActivity() {
    return this.last_activity < addMinutes(new Date(), 15);
  }
}
