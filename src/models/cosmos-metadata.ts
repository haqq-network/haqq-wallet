import createHash from 'create-hash';

import {realm} from '@app/models/index';

export enum CosmosMetadataType {
  delegation = 'delegation',
  undelegation = 'undelegation',
  reward = 'reward',
}

export class CosmosMetadata extends Realm.Object {
  hash!: string;
  type!: CosmosMetadataType;
  delegator!: string;
  validator!: string;
  amount!: number;
  completion_time: string | undefined;

  static schema = {
    name: 'CosmosMetadata',
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
      .update(`${CosmosMetadataType.delegation}:${delegator}:${validator}`)
      .digest()
      .toString('hex');

    realm.write(() => {
      realm.create<CosmosMetadata>(
        CosmosMetadata.schema.name,
        {
          hash,
          type: CosmosMetadataType.delegation,
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
      .update(`${CosmosMetadataType.reward}:${delegator}:${validator}`)
      .digest()
      .toString('hex');

    realm.write(() => {
      realm.create<CosmosMetadata>(
        CosmosMetadata.schema.name,
        {
          hash,
          type: CosmosMetadataType.reward,
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
        `${CosmosMetadataType.undelegation}:${delegator}:${validator}:${completion_time}`,
      )
      .digest()
      .toString('hex');

    realm.write(() => {
      realm.create<CosmosMetadata>(
        CosmosMetadata.schema.name,
        {
          hash,
          type: CosmosMetadataType.undelegation,
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
    const obj = realm.objectForPrimaryKey<CosmosMetadata>(
      CosmosMetadata.schema.name,
      hash,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }
}
