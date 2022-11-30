import {ethers} from 'ethers';

import {generateUUID} from '@app/utils';

import {realm} from './index';

export class Provider extends Realm.Object {
  id!: string;
  name!: string;
  ethChainId!: number;
  ethRpcEndpoint!: string;
  cosmosChainId!: string;
  cosmosRestEndpoint!: string;
  tmRpcEndpoint!: string;
  explorer: string | undefined;
  isEditable!: boolean;

  static schema = {
    name: 'Provider',
    properties: {
      id: 'string',
      name: 'string',
      ethRpcEndpoint: 'string',
      ethChainId: 'int',
      cosmosChainId: 'string',
      cosmosRestEndpoint: 'string',
      tmRpcEndpoint: 'string',
      explorer: 'string?',
      isEditable: 'bool',
    },
    primaryKey: 'id',
  };

  update(params: Partial<Provider>) {
    realm.write(() => {
      realm.create(
        Provider.schema.name,
        {
          ...this.toJSON(),
          ...params,
          isEditable: this.isEditable,
          id: this.id,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }

  static create(params: Partial<Provider>) {
    realm.write(() => {
      realm.create(Provider.schema.name, {
        ...params,
        tmRpcEndpoint: '',
        isEditable: true,
        id: generateUUID(),
      });
    });
  }

  static remove(id: string) {
    const obj = realm.objectForPrimaryKey<Provider>(Provider.schema.name, id);

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getProviders() {
    return realm.objects<Provider>('Provider');
  }

  static getProvider(providerId: string) {
    return realm.objectForPrimaryKey<Provider>('Provider', providerId);
  }

  get rpcProvider() {
    return new ethers.providers.StaticJsonRpcProvider(this.ethRpcEndpoint, {
      chainId: this.ethChainId,
      name: this.id,
    });
  }
}
