export class Contact extends Realm.Object {
  account!: string;
  name!: string;

  static schema = {
    name: 'Contact',
    properties: {
      account: 'string',
      name: 'string',
    },
    primaryKey: 'account',
  };
}
