import {realm} from '@app/models/index';

export class NftCollection extends Realm.Object {
  static schema = {
    name: 'NftCollection',
    properties: {
      address: 'string',
      addressBookId: 'string',
      name: 'string',
      preview: 'string?',
      description: 'string?',
      tokens: 'string[]',
    },
    primaryKey: 'address',
  };
  address!: string;
  name!: string;
  preview: string;
  description: string;
  tokens: string[];

  static create(address: string, params: Partial<NftCollection>) {
    realm.write(() => {
      realm.create<NftCollection>(
        NftCollection.schema.name,
        {
          ...params,
          address: address.toLowerCase(),
        },
        Realm.UpdateMode.Modified,
      );
    });

    return address;
  }

  static remove(address: string) {
    const obj = realm.objectForPrimaryKey<NftCollection>(
      NftCollection.schema.name,
      address,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<NftCollection>(NftCollection.schema.name);
  }

  static getById(address: string) {
    return realm.objectForPrimaryKey<NftCollection>(
      NftCollection.schema.name,
      address.toLowerCase(),
    );
  }

  static removeAll() {
    const contacts = realm.objects<NftCollection>(NftCollection.schema.name);

    for (const contact of contacts) {
      realm.write(() => {
        realm.delete(contact);
      });
    }
  }

  update(params: Partial<NftCollection>) {
    realm.write(() => {
      realm.create(
        NftCollection.schema.name,
        {
          ...this.toJSON(),
          ...params,
          address: this.address,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }
}
