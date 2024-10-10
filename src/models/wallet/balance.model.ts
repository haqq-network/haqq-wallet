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

export class BalanceModel {
  constructor(public model: BalanceData) {}

  get vested() {
    return this.model.vested;
  }
  setVested(vested = Balance.Empty) {
    this.model.vested = vested;
  }
  addVested(vested = Balance.Empty) {
    this.model.vested.operate(vested, 'add');
  }

  get staked() {
    return this.model.staked;
  }
  setStaked(staked = Balance.Empty) {
    this.model.staked = staked;
  }
  addStaked(staked = Balance.Empty) {
    this.model.staked.operate(staked, 'add');
  }

  get available() {
    return this.model.available;
  }
  setAvailable(available = Balance.Empty) {
    this.model.available = available;
  }
  addAvailable(available = Balance.Empty) {
    this.model.available.operate(available, 'add');
  }

  get total() {
    return this.model.total;
  }
  setTotal(total = Balance.Empty) {
    this.model.total = total;
  }
  addTotal(total = Balance.Empty) {
    this.model.total.operate(total, 'add');
  }

  get locked() {
    return this.model.locked;
  }
  setLocked(locked = Balance.Empty) {
    this.model.locked = locked;
  }
  addLocked(locked = Balance.Empty) {
    this.model.locked.operate(locked, 'add');
  }

  get availableForStake() {
    return this.model.availableForStake;
  }
  setAvailableForState(availableForStake?: Balance) {
    this.model.availableForStake = availableForStake ?? Balance.Empty;
  }
  addAvailableForState(availableForStake = Balance.Empty) {
    this.model.availableForStake.operate(availableForStake, 'add');
  }

  get nextVestingUnlockDate() {
    return this.model.unlock;
  }
  setNextVestingUnlockDate(unlock?: Date) {
    this.model.unlock = unlock ?? new Date(0);
  }
}
