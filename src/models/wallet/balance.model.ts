import {Balance} from '@app/services/balance';

type BalanceData = {
  vested: Balance;
  staked: Balance;
  available: Balance;
  total: Balance;
  locked: Balance;
  availableForStake: Balance;
  // next time to unlock vested tokens
  unlock: Date;
};

export type BalanceDataJson = {
  vested: string;
  staked: string;
  available: string;
  total: string;
  locked: string;
  availableForStake: string;
  // next time to unlock vested tokens
  unlock: string;
};

export class BalanceModel {
  constructor(public model: BalanceData) {}

  get vested() {
    return this.model.vested;
  }
  setVested(vested = Balance.Empty) {
    this.model.vested = vested;
  }
  addVested(vested = Balance.Empty) {
    this.model.vested = this.model.vested.operate(vested, 'add');
  }

  get staked() {
    return this.model.staked;
  }
  setStaked(staked = Balance.Empty) {
    this.model.staked = staked;
  }
  addStaked(staked = Balance.Empty) {
    this.model.staked = this.model.staked.operate(staked, 'add');
  }

  get available() {
    return this.model.available;
  }
  setAvailable(available = Balance.Empty) {
    this.model.available = available;
  }
  addAvailable(available = Balance.Empty) {
    this.model.available = this.model.available.operate(available, 'add');
  }

  get total() {
    return this.model.total;
  }
  setTotal(total = Balance.Empty) {
    this.model.total = total;
  }
  addTotal(total = Balance.Empty) {
    this.model.total = this.model.total.operate(total, 'add');
  }

  get locked() {
    return this.model.locked;
  }
  setLocked(locked = Balance.Empty) {
    this.model.locked = locked;
  }
  addLocked(locked = Balance.Empty) {
    this.model.locked = this.model.locked.operate(locked, 'add');
  }

  get availableForStake() {
    return this.model.availableForStake;
  }
  setAvailableForState(availableForStake?: Balance) {
    this.model.availableForStake = availableForStake ?? Balance.Empty;
  }
  addAvailableForState(availableForStake = Balance.Empty) {
    this.model.availableForStake = this.model.availableForStake.operate(
      availableForStake,
      'add',
    );
  }

  get nextVestingUnlockDate() {
    return this.model.unlock;
  }
  setNextVestingUnlockDate(unlock?: Date) {
    this.model.unlock = unlock ?? new Date(0);
  }

  toJSON = (): BalanceDataJson => {
    return {
      staked: JSON.parse(this.staked.toJsonString()),
      vested: JSON.parse(this.vested.toJsonString()),
      available: JSON.parse(this.available.toJsonString()),
      total: JSON.parse(this.total.toJsonString()),
      locked: JSON.parse(this.locked.toJsonString()),
      availableForStake: JSON.parse(this.availableForStake.toJsonString()),
      unlock: this.nextVestingUnlockDate.toISOString(),
    };
  };

  static fromJSON(data: string | BalanceDataJson): BalanceModel {
    let parsed = {} as BalanceDataJson;

    if (typeof data === 'string') {
      parsed = JSON.parse(data);
    }

    if (typeof data === 'object' && ('available' in data || 'total' in data)) {
      parsed = data;
    }

    return new BalanceModel({
      staked: Balance.fromJsonString(parsed.staked),
      vested: Balance.fromJsonString(parsed.vested),
      available: Balance.fromJsonString(parsed.available),
      total: Balance.fromJsonString(parsed.total),
      locked: Balance.fromJsonString(parsed.locked),
      availableForStake: Balance.fromJsonString(parsed.availableForStake),
      unlock: new Date(parsed.unlock),
    });
  }

  static get Empty() {
    return new BalanceModel({
      staked: Balance.Empty,
      vested: Balance.Empty,
      available: Balance.Empty,
      total: Balance.Empty,
      locked: Balance.Empty,
      availableForStake: Balance.Empty,
      unlock: new Date(0),
    });
  }
}
