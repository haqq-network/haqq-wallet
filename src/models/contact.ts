import {realm} from '@app/models';

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

  static create(address: string, params: Partial<Contact>) {
    realm.write(() => {
      realm.create<Contact>(
        Contact.schema.name,
        {
          ...params,
          account: address.toLowerCase(),
        },
        Realm.UpdateMode.Modified,
      );
    });

    return address;
  }

  static remove(address: string) {
    const obj = realm.objectForPrimaryKey<Contact>(
      Contact.schema.name,
      address,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<Contact>(Contact.schema.name);
  }

  static getById(address: string) {
    return realm.objectForPrimaryKey<Contact>(
      Contact.schema.name,
      address.toLowerCase(),
    );
  }

  update(params: Partial<Contact>) {
    realm.write(() => {
      realm.create(
        Contact.schema.name,
        {
          ...this.toJSON(),
          ...params,
          account: this.account,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }

  static removeAll() {
    const contacts = realm.objects<Contact>(Contact.schema.name);

    for (const contact of contacts) {
      realm.write(() => {
        realm.delete(contact);
      });
    }
  }
}
