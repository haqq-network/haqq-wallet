import {realm} from '@app/models';
import {generateUUID} from '@app/utils';

export class Web3BrowserSearchHistory extends Realm.Object {
  static schema = {
    name: 'Web3BrowserSearchHistory',
    properties: {
      id: 'string',
      url: 'string',
      title: 'string',
      createdAt: 'date',
    },
    primaryKey: 'id',
  };
  id!: string;
  url!: string;
  title!: string;
  createdAt!: Date;

  static create(params: Partial<Web3BrowserSearchHistory>) {
    const id = generateUUID();
    realm.write(() => {
      realm.create<Web3BrowserSearchHistory>(
        Web3BrowserSearchHistory.schema.name,
        {
          ...params,
          id: id.toLowerCase(),
          createdAt: new Date(),
        },
        Realm.UpdateMode.Modified,
      );
    });

    return id;
  }

  static remove(id: string) {
    const obj = realm.objectForPrimaryKey<Web3BrowserSearchHistory>(
      Web3BrowserSearchHistory.schema.name,
      id.toLowerCase(),
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<Web3BrowserSearchHistory>(
      Web3BrowserSearchHistory.schema.name,
    );
  }

  static removeAll() {
    const WalletConnectStorages = realm.objects<Web3BrowserSearchHistory>(
      Web3BrowserSearchHistory.schema.name,
    );

    for (const WalletConnectStorage of WalletConnectStorages) {
      realm.write(() => {
        realm.delete(WalletConnectStorage);
      });
    }
  }

  update(params: Partial<Web3BrowserSearchHistory>) {
    realm.write(() => {
      realm.create(
        Web3BrowserSearchHistory.schema.name,
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
