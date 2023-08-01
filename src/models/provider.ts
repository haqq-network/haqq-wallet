import {ethers} from 'ethers';

import {generateUUID} from '@app/utils';

import {realm} from './index';

export type ProviderKeys = keyof Omit<Provider, 'id'>;

export class Provider extends Realm.Object {
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
      evmEndpoints: 'string[]',
      tmEndpoints: 'string[]',
    },
    primaryKey: 'id',
  };
  id!: string;
  name!: string;
  ethChainId!: number;
  ethRpcEndpoint!: string;
  cosmosChainId!: string;
  cosmosRestEndpoint!: string;
  tmRpcEndpoint!: string;
  explorer: string | undefined;
  isEditable!: boolean;
  evmEndpoints: string[];
  tmEndpoints: string[];

  get ethChainIdHex() {
    return '0x' + this.ethChainId.toString(16);
  }

  get networkVersion() {
    return this.cosmosChainId.split('-')[1];
  }

  get rpcProvider() {
    return new ethers.providers.StaticJsonRpcProvider(this.ethRpcEndpoint, {
      chainId: this.ethChainId,
      name: this.id,
    });
  }

  setEvmEndpoint(endpoint: string) {
    realm.write(() => {
      this.ethRpcEndpoint = endpoint;
    });
  }

  static create(params: Partial<Provider>) {
    let id = generateUUID();
    realm.write(() => {
      realm.create(Provider.schema.name, {
        ...params,
        tmRpcEndpoint: '',
        isEditable: true,
        id,
      });
    });

    return id;
  }

  static remove(id: string) {
    const obj = realm.objectForPrimaryKey<Provider>(Provider.schema.name, id);

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<Provider>('Provider');
  }

  static getById(providerId: string) {
    return realm.objectForPrimaryKey<Provider>('Provider', providerId);
  }

  static getByChainId(
    ethChainId: number | string,
  ): (Provider & Realm.Object<unknown, never>) | null {
    if (!ethChainId && Number.isNaN(ethChainId)) {
      return null;
    }

    return Provider.getAll()?.filtered?.(`ethChainId = '${ethChainId}'`)?.[0];
  }

  static getByChainIdHex(ethChainIdHex: string) {
    if (!ethChainIdHex) {
      return null;
    }
    return Provider.getByChainId(parseInt(ethChainIdHex, 16));
  }

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
}
