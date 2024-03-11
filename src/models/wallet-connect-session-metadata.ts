import {realm} from '@app/models';
import {WalletConnect} from '@app/services/wallet-connect';

export class WalletConnectSessionMetadata extends Realm.Object {
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

  static create(topic: string, params?: Partial<WalletConnectSessionMetadata>) {
    realm.write(() => {
      realm.create<WalletConnectSessionMetadata>(
        WalletConnectSessionMetadata.schema.name,
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
    const obj = realm.objectForPrimaryKey<WalletConnectSessionMetadata>(
      WalletConnectSessionMetadata.schema.name,
      topic.toLowerCase(),
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<WalletConnectSessionMetadata>(
      WalletConnectSessionMetadata.schema.name,
    );
  }

  static getById(topic: string) {
    return realm.objectForPrimaryKey<WalletConnectSessionMetadata>(
      WalletConnectSessionMetadata.schema.name,
      topic.toLowerCase(),
    );
  }

  static async removeAll() {
    const sessions = WalletConnectSessionMetadata.getAll();

    for (const s of sessions) {
      try {
        await WalletConnect.instance.disconnectSession(s.topic);
      } catch (err) {
        Logger.error('WalletConnectSessionMetadata.removeAll', s);
      }
    }
  }

  update(params: Partial<WalletConnectSessionMetadata>) {
    realm.write(() => {
      realm.create(
        WalletConnectSessionMetadata.schema.name,
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
