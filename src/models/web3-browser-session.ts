import {realm} from '@app/models';

export class Web3BrowserSession extends Realm.Object {
  static schema = {
    name: 'Web3BrowserSession',
    properties: {
      origin: 'string',
      selectedAccount: 'string',
      selectedChainIdHex: 'string',
      disconected: 'bool',
      createdAt: 'date',
      onlineAt: 'date',
    },
    primaryKey: 'origin',
  };
  origin!: string;
  selectedAccount!: string;
  selectedChainIdHex!: string;
  disconected!: boolean;
  createdAt!: Date;
  onlineAt!: Date;

  get isActive() {
    return !!this.selectedAccount && !this.disconected;
  }

  static create(origin: string, params?: Partial<Web3BrowserSession>) {
    realm.write(() => {
      realm.create<Web3BrowserSession>(
        Web3BrowserSession.schema.name,
        {
          ...params,
          disconected: false,
          origin: origin.toLowerCase(),
          createdAt: new Date(),
          onlineAt: new Date(),
        },
        Realm.UpdateMode.Modified,
      );
    });

    return origin;
  }

  static remove(topic: string) {
    const obj = realm.objectForPrimaryKey<Web3BrowserSession>(
      Web3BrowserSession.schema.name,
      topic.toLowerCase(),
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<Web3BrowserSession>(Web3BrowserSession.schema.name);
  }

  static getByOrigin(origin: string) {
    return realm.objectForPrimaryKey<Web3BrowserSession>(
      Web3BrowserSession.schema.name,
      origin.toLowerCase(),
    );
  }

  static removeAll() {
    const WalletConnectStorages = realm.objects<Web3BrowserSession>(
      Web3BrowserSession.schema.name,
    );

    for (const WalletConnectStorage of WalletConnectStorages) {
      realm.write(() => {
        realm.delete(WalletConnectStorage);
      });
    }
  }

  disconnect() {
    this.update({
      selectedAccount: '',
      disconected: true,
    });
  }

  update(params: Partial<Web3BrowserSession>) {
    realm.write(() => {
      realm.create(
        Web3BrowserSession.schema.name,
        {
          ...this.toJSON(),
          ...params,
          origin: this.origin,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }
}
