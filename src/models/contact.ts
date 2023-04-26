import {realm} from '@app/models';

export enum ContactType {
  address = 'address',
  contract = 'contract',
}

export class Contact extends Realm.Object {
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
  account!: string;
  name!: string;
  type: ContactType;
  visible: boolean;

  static create(address: string, params: Omit<Partial<Contact>, 'address'>) {
    const exists = Contact.getById(address);
    realm.write(() => {
      realm.create<Contact>(
        Contact.schema.name,
        {
          ...(exists ?? {}),
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

  static removeAll() {
    const contacts = realm.objects<Contact>(Contact.schema.name);

    for (const contact of contacts) {
      realm.write(() => {
        realm.delete(contact);
      });
    }
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
}
