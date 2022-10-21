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
}
