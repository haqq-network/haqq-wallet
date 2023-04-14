import {realm} from '@app/models';
import {Link} from '@app/types';
import {generateUUID} from '@app/utils';

export class Web3BrowserBookmark extends Realm.Object implements Link {
  static schema = {
    name: 'Web3BrowserBookmark',
    properties: {
      id: 'string',
      url: 'string',
      title: 'string',
      icon: 'string?',
      order: 'int',
      createdAt: 'int',
    },
    primaryKey: 'id',
  };
  id!: string;
  url!: string;
  title!: string;
  order!: number;
  icon!: string | undefined;
  createdAt!: number;

  static create(params: Partial<Web3BrowserBookmark>) {
    const id = generateUUID();
    realm.write(() => {
      realm.create<Web3BrowserBookmark>(
        Web3BrowserBookmark.schema.name,
        {
          ...params,
          id: id.toLowerCase(),
          order: 0,
          createdAt: Date.now(),
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
    return realm
      .objects<Web3BrowserBookmark>(Web3BrowserBookmark.schema.name)
      ?.sorted?.('order');
  }

  static getByUrl(url: string) {
    return Web3BrowserBookmark.getAll()?.filtered?.(`url = '${url}'`)?.[0];
  }

  static getById(id: string) {
    return realm.objectForPrimaryKey<Web3BrowserBookmark>(
      Web3BrowserBookmark.schema.name,
      id,
    );
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
