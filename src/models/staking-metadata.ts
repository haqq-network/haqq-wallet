import createHash from 'create-hash';

import {realm} from '@app/models/index';

export enum StakingMetadataType {
  delegation = 'delegation',
  undelegation = 'undelegation',
  reward = 'reward',
}

export class StakingMetadata extends Realm.Object {
  hash!: string;
  type!: StakingMetadataType;
  delegator!: string;
  validator!: string;
  amount!: number;
  completion_time: string | undefined;

  static schema = {
    name: 'StakingMetadata',
    properties: {
      hash: 'string',
      type: 'string',
      delegator: 'string',
      validator: 'string',
      amount: 'int',
      completion_time: 'string?',
    },
    primaryKey: 'hash',
  };

  static createDelegation(
    delegator: string,
    validator: string,
    amount: string,
  ) {
    const hash = createHash('sha1')
      .update(`${StakingMetadataType.delegation}:${delegator}:${validator}`)
      .digest()
      .toString('hex');

    realm.write(() => {
      realm.create<StakingMetadata>(
        StakingMetadata.schema.name,
        {
          hash,
          type: StakingMetadataType.delegation,
          delegator,
          validator,
          amount: parseFloat(amount),
        },
        Realm.UpdateMode.Modified,
      );
    });

    return hash;
  }

  static createReward(delegator: string, validator: string, amount: string) {
    const hash = createHash('sha1')
      .update(`${StakingMetadataType.reward}:${delegator}:${validator}`)
      .digest()
      .toString('hex');

    realm.write(() => {
      realm.create<StakingMetadata>(
        StakingMetadata.schema.name,
        {
          hash,
          type: StakingMetadataType.reward,
          delegator,
          validator,
          amount: parseFloat(amount),
        },
        Realm.UpdateMode.Modified,
      );
    });

    return hash;
  }

  static createUnDelegation(
    delegator: string,
    validator: string,
    amount: string,
    completion_time: string,
  ) {
    const hash = createHash('sha1')
      .update(
        `${StakingMetadataType.undelegation}:${delegator}:${validator}:${completion_time}`,
      )
      .digest()
      .toString('hex');

    realm.write(() => {
      realm.create<StakingMetadata>(
        StakingMetadata.schema.name,
        {
          hash,
          type: StakingMetadataType.undelegation,
          delegator,
          validator,
          amount: parseFloat(amount),
          completion_time,
        },
        Realm.UpdateMode.Modified,
      );
    });

    return hash;
  }

  static remove(hash: string) {
    const obj = realm.objectForPrimaryKey<StakingMetadata>(
      StakingMetadata.schema.name,
      hash,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getRewardsForValidator(address: string) {
    const rows = realm.objects<StakingMetadata>(StakingMetadata.schema.name);

    return rows.filtered(
      `validator = '${address}' and type = '${StakingMetadataType.reward}'`,
    );
  }

  static getDelegationsForValidator(address: string) {
    const rows = realm.objects<StakingMetadata>(StakingMetadata.schema.name);

    return rows.filtered(
      `validator = '${address}' and type = '${StakingMetadataType.delegation}'`,
    );
  }

  static getUnDelegationsForValidator(address: string) {
    const rows = realm.objects<StakingMetadata>(StakingMetadata.schema.name);

    return rows.filtered(
      `validator = '${address}' and type = '${StakingMetadataType.undelegation}'`,
    );
  }

  static getAll() {
    return realm.objects<StakingMetadata>(StakingMetadata.schema.name);
  }
}
