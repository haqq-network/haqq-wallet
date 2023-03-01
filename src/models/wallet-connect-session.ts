import {realm} from '@app/models';

export class WalletConnectSession extends Realm.Object {
  static schema = {
    name: 'WalletConnectStorage',
    properties: {
      topic: 'string',
      createdAt: 'int',
    },
    primaryKey: 'topic',
  };
  topic!: string;
  createdAt!: number;

  static create(topic: string, params?: Partial<WalletConnectSession>) {
    realm.write(() => {
      realm.create<WalletConnectSession>(
        WalletConnectSession.schema.name,
        {
          ...params,
          topic: topic.toLowerCase(),
          createdAt: Date.now(),
        },
        Realm.UpdateMode.Modified,
      );
    });

    return topic;
  }

  static remove(topic: string) {
    const obj = realm.objectForPrimaryKey<WalletConnectSession>(
      WalletConnectSession.schema.name,
      topic.toLowerCase(),
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<WalletConnectSession>(
      WalletConnectSession.schema.name,
    );
  }

  static getById(topic: string) {
    return realm.objectForPrimaryKey<WalletConnectSession>(
      WalletConnectSession.schema.name,
      topic.toLowerCase(),
    );
  }

  static removeAll() {
    const WalletConnectStorages = realm.objects<WalletConnectSession>(
      WalletConnectSession.schema.name,
    );

    for (const WalletConnectStorage of WalletConnectStorages) {
      realm.write(() => {
        realm.delete(WalletConnectStorage);
      });
    }
  }

  update(params: Partial<WalletConnectSession>) {
    realm.write(() => {
      realm.create(
        WalletConnectSession.schema.name,
        {
          ...this.toJSON(),
          ...params,
          topic: this.topic,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }
}
