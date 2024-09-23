export class ContactRealmObject extends Realm.Object {
  static schema = {
    name: 'Contact',
    properties: {
      account: 'string',
      name: 'string',
      type: 'string',
      visible: 'bool',
    },
    primaryKey: 'account',
  };
}
