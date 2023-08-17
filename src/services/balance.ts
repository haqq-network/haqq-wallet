import BN from 'bn.js';
import Decimal from 'decimal.js';

import {cleanNumber} from '@app/helpers';
import {Balance as IBalance} from '@app/types';
import {CURRENCY_NAME, WEI} from '@app/variables/common';

const zeroBN = new BN(0, 'hex');

export class Balance implements IBalance {
  static Empty = new Balance(zeroBN);
  private bnRaw;

  constructor(balance: BN | number) {
    if (!(balance as BN)?.isZero?.()) {
      this.bnRaw = balance as BN;
    } else {
      this.bnRaw = new BN(balance, 'hex');
    }
  }

  /**
   * Raw BN.js instance of balance
   * @readonly
   */
  get raw() {
    return this.bnRaw;
  }

  /**
   * Convert balance to a long integer
   */
  toNumber = () => {
    return Number(this.bnRaw.toString());
  };

  /**
   * Convert balance to float according to WEI
   */
  toFloat = () => {
    const float = new Decimal(this.toNumber()).div(WEI).toNumber();
    return float;
  };

  /**
   * Convert balance to float string according to cleanNumber helper
   * @example 123.45
   */
  toFloatString = () => {
    return cleanNumber(this.toFloat());
  };

  /**
   * Convert balance to float string according to cleanNumber helper and append currency name
   * @example 123.45 ISLM
   */
  toBalanceString = () => {
    const suffix = ` ${CURRENCY_NAME}`;
    return this.toFloatString() + suffix;
  };

  toString = () => {
    return this.bnRaw.toString();
  };

  toHex = () => {
    return this.bnRaw.toString('hex');
  };

  /**
   * Is balance has money (grater than zero)
   */
  isPositive = () => {
    return this.bnRaw.gt(zeroBN);
  };

  add = (value: BN | Balance) => {
    let newBalance;
    const prev = this.bnRaw;
    if ((value as Balance).raw) {
      newBalance = prev.add((value as Balance).raw);
    } else {
      newBalance = prev.add(value as BN);
    }
    return new Balance(newBalance);
  };
}
