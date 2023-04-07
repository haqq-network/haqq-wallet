import {realm} from '@app/models';
import {generateUUID} from '@app/utils';

export class Web3BrowserBookmark extends Realm.Object {
  static schema = {
    name: 'Web3BrowserBookmark',
    properties: {
      id: 'string',
      url: 'string',
      title: 'string',
    },
    primaryKey: 'id',
  };
  id!: string;
  url!: string;
  title!: string;

  static create(params: Web3BrowserBookmark) {
    const id = generateUUID();
    realm.write(() => {
      realm.create<Web3BrowserBookmark>(
        Web3BrowserBookmark.schema.name,
        {
          ...params,
          id: id.toLowerCase(),
        },
        Realm.UpdateMode.Modified,
      );
    });

    return id;
  }

  static remove(id: string) {
    const obj = realm.objectForPrimaryKey<Web3BrowserBookmark>(
      Web3BrowserBookmark.schema.name,
      id.toLowerCase(),
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<Web3BrowserBookmark>(Web3BrowserBookmark.schema.name);
  }

  static removeAll() {
    const WalletConnectStorages = realm.objects<Web3BrowserBookmark>(
      Web3BrowserBookmark.schema.name,
    );

    for (const WalletConnectStorage of WalletConnectStorages) {
      realm.write(() => {
        realm.delete(WalletConnectStorage);
      });
    }
  }

  update(params: Partial<Web3BrowserBookmark>) {
    realm.write(() => {
      realm.create(
        Web3BrowserBookmark.schema.name,
        {
          ...this.toJSON(),
          ...params,
          id: this.id,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }
}
