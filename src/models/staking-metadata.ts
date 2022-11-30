import createHash from 'create-hash';

import {realm} from '@app/models/index';
import {WEI} from '@app/variables';

export enum StakingMetadataType {
  delegation = 'delegation',
  undelegation = 'undelegation',
  reward = 'reward',
}

type SummaryInfoCallback = (sums: {
  rewardsSum: number;
  stakingSum: number;
  unDelegationSum: number;
}) => void;

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
      amount: 'float',
      completion_time: 'string?',
    },
    primaryKey: 'hash',
  };

  static createDelegation(
    delegator: string,
    validator: string,
    amount: string,
  ) {
    if (!parseInt(amount, 10)) {
      return null;
    }

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
          amount: parseInt(amount, 10) / WEI,
        },
        Realm.UpdateMode.Modified,
      );
    });

    return hash;
  }

  static createReward(delegator: string, validator: string, amount: string) {
    if (!parseInt(amount, 10)) {
      return null;
    }

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
          amount: parseInt(amount, 10) / WEI,
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
    if (!parseInt(amount, 10)) {
      return null;
    }

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
          amount: parseInt(amount, 10) / WEI,
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

  static summaryInfoListener =
    (callback: SummaryInfoCallback) =>
    (
      data: Realm.Collection<StakingMetadata & Realm.Object<unknown, never>>,
    ) => {
      const sumReduce = (
        stakingData: (StakingMetadata & Realm.Object<unknown, never>)[],
      ) => stakingData.reduce((acc, val) => acc + val.amount, 0);

      const rewards = data.filter(
        val => val.type === StakingMetadataType.reward,
      );
      const delegations = data.filter(
        val => val.type === StakingMetadataType.delegation,
      );
      const unDelegations = data.filter(
        val => val.type === StakingMetadataType.undelegation,
      );

      const rewardsSum = sumReduce(rewards);
      const stakingSum = sumReduce(delegations);
      const unDelegationSum = sumReduce(unDelegations);
      callback({rewardsSum, stakingSum, unDelegationSum});
    };
}
