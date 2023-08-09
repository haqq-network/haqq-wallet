import BN from 'bn.js';
import Decimal from 'decimal.js';

import {cleanNumber} from '@app/helpers';
import {Balance as IBalance} from '@app/types';
import {WEI} from '@app/variables/common';

const zeroBN = new BN(0, 'hex');

export class Balance implements IBalance {
  static Empty = new Balance(zeroBN);
  private bnRaw;

  constructor(balance: BN | number) {
    if (!(balance as BN)?.isZero()) {
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
   */
  toFloatString = () => {
    return cleanNumber(this.toFloat());
  };

  toString = () => {
    return this.bnRaw.toString();
  };

  toHex = () => {
    return this.bnRaw.toString('hex');
  };

  /**
   * Is balance has money
   */
  isPositive = () => {
    return this.bnRaw.gt(zeroBN);
  };
}
