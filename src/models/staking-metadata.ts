import createHash from 'create-hash';

import {realm} from '@app/models/index';
import {decimalToHex} from '@app/utils';
import {WEI} from '@app/variables/common';

export enum StakingMetadataType {
  delegation = 'delegation',
  undelegation = 'undelegation',
  reward = 'reward',
}

export class StakingMetadata extends Realm.Object {
  static schema = {
    name: 'StakingMetadata',
    properties: {
      hash: 'string',
      type: 'string',
      delegator: 'string',
      validator: 'string',
      amount: 'float',
      amountHex: 'string',
      completion_time: 'string?',
    },
    primaryKey: 'hash',
  };
  hash!: string;
  type!: StakingMetadataType;
  delegator!: string;
  validator!: string;
  amount!: number;
  amountHex!: string;
  completion_time: string | undefined;

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
          amountHex: decimalToHex(amount),
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
          amountHex: decimalToHex(amount),
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
          amountHex: decimalToHex(amount),
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

  static getAllByType(type: string) {
    const rows = realm.objects<StakingMetadata>(StakingMetadata.schema.name);
    return rows.filtered(`type = '${type}'`);
  }

  static getAllByValidator(validator: string) {
    const rows = realm.objects<StakingMetadata>(StakingMetadata.schema.name);
    return rows.filtered(`validator = '${validator}'`);
  }

  /**
   * @param {string} address - cosmos wallet address
   */
  static getAllByDelegator(address: string) {
    const rows = realm.objects<StakingMetadata>(StakingMetadata.schema.name);
    return rows.filtered('delegator = $0', address);
  }

  static toMap(rows: Realm.Results<StakingMetadata> | StakingMetadata[]) {
    return (rows as StakingMetadata[])?.reduce?.(
      (prev, curr) => ({
        ...prev,
        [curr.type]: curr,
      }),
      {},
    ) as Record<StakingMetadataType, StakingMetadata>;
  }
}
