import {ethers} from 'ethers';

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
    },
    primaryKey: 'id',
  };

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
