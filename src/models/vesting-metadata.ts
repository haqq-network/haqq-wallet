import createHash from 'create-hash';

import {realm} from '@app/models/index';

export enum VestingMetadataType {
  locked = 'locked',
  unvested = 'unvested',
  vested = 'vested',
}

export class VestingMetadata extends Realm.Object {
  static schema = {
    name: 'VestingMetadata',
    properties: {
      hash: 'string',
      type: 'string',
      account: 'string',
      amount: 'string',
    },
    primaryKey: 'hash',
  };
  hash!: string;
  type!: VestingMetadataType;
  account!: string;
  amount!: string;

  static create(account: string, type: VestingMetadataType, amount: string) {
    const hash = createHash('sha1')
      .update(`${type}:${account}`)
      .digest()
      .toString('hex');

    realm.write(() => {
      realm.create<VestingMetadata>(
        VestingMetadata.schema.name,
        {
          hash,
          type,
          account,
          amount: amount,
        },
        Realm.UpdateMode.Modified,
      );
    });

    return hash;
  }

  static remove(hash: string) {
    const obj = realm.objectForPrimaryKey<VestingMetadata>(
      VestingMetadata.schema.name,
      hash,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<VestingMetadata>(VestingMetadata.schema.name);
  }

  static getAllByType(type: VestingMetadataType) {
    const rows = realm.objects<VestingMetadata>(VestingMetadata.schema.name);
    return rows.filtered('type = $0', type);
  }

  static getAllByAccount(account: string) {
    const rows = realm.objects<VestingMetadata>(VestingMetadata.schema.name);
    return rows.filtered('account = $0', account);
  }
}
