import {ethers} from 'ethers';
import {realm} from './index';

export class Provider extends Realm.Object {
  id!: string;
  name!: string;
  network!: string;
  chainId!: number;
  explorer: string | undefined;

  static schema = {
    name: 'Provider',
    properties: {
      id: 'string',
      name: 'string',
      network: 'string',
      chainId: 'int',
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
    return new ethers.providers.StaticJsonRpcProvider(this.network, {
      chainId: this.chainId,
      name: this.id,
    });
  }
}
