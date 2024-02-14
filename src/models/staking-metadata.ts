import createHash from 'create-hash';
import {makeAutoObservable} from 'mobx';

import {decimalToHex} from '@app/utils';
import {WEI} from '@app/variables/common';

export enum StakingMetadataType {
  delegation = 'delegation',
  undelegation = 'undelegation',
  reward = 'reward',
}

export type StakingMetadata = {
  hash: string;
  type: StakingMetadataType;
  delegator: string;
  validator: string;
  amount: number;
  amountHex: string;
  completion_time?: string;
};

class StakingMetadataStore {
  stakingMetadata: Record<string, StakingMetadata> = {};

  constructor() {
    makeAutoObservable(this);
  }

  create(
    type: StakingMetadataType,
    delegator: string,
    validator: string,
    amount: string,
    completion_time?: string,
  ) {
    if (!parseInt(amount, 10)) {
      return null;
    }

    const hash = createHash('sha1')
      .update(
        `${type}:${delegator}:${validator}${
          completion_time ? `:${completion_time}` : ''
        }`,
      )
      .digest()
      .toString('hex');

    this.stakingMetadata[hash] = {
      hash,
      type,
      delegator,
      validator,
      amount: parseInt(amount, 10) / WEI,
      amountHex: decimalToHex(amount),
      completion_time,
    };

    return hash;
  }

  getAll() {
    return Object.values(this.stakingMetadata);
  }

  getAllByTypeForValidator(address: string, type: StakingMetadataType) {
    return Object.values(this.stakingMetadata).filter(
      e =>
        e.validator.toLowerCase() === address.toLowerCase() && e.type === type,
    );
  }

  getAllByType(type: string) {
    return Object.values(this.stakingMetadata).filter(e => e.type === type);
  }

  getAllByValidator(validator: string) {
    return Object.values(this.stakingMetadata).filter(
      e => e.validator === validator,
    );
  }

  getAllByDelegator(address: string) {
    return Object.values(this.stakingMetadata).filter(
      e => e.delegator === address,
    );
  }

  remove(hash: string) {
    delete this.stakingMetadata[hash];
  }
}

const instance = new StakingMetadataStore();
export {instance as StakingMetadata};
