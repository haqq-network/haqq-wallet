import BN from 'bn.js';
import Decimal from 'decimal.js';

import {cleanNumber} from '@app/helpers';
import {BalanceConstructor, Balance as IBalance} from '@app/types';
import {CURRENCY_NAME, WEI} from '@app/variables/common';

const zeroBN = new BN(0, 'hex');

export class Balance implements IBalance {
  static Empty = new Balance(zeroBN);
  private bnRaw = zeroBN;

  constructor(balance: BalanceConstructor) {
    if (balance instanceof Balance) {
      this.bnRaw = balance.bnRaw as BN;
      return;
    }

    if (typeof balance === 'string') {
      this.bnRaw = new BN(balance.replace('0x', ''), 'hex');
      return;
    }

    if (typeof balance === 'number') {
      this.bnRaw = new BN(balance);
      return;
    }

    this.bnRaw = balance as BN;
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

  add = (value?: BalanceConstructor) => {
    if (!value) {
      return this;
    }
    const {bnRaw} = new Balance(value);
    return new Balance(this.bnRaw.add(bnRaw));
  };

  eq = (balance?: BalanceConstructor) => {
    if (!balance) {
      return false;
    }
    const {bnRaw} = new Balance(balance);
    return this.bnRaw.eq(bnRaw);
  };

  mul = (balance?: BalanceConstructor) => {
    if (!balance) {
      return this;
    }
    const {bnRaw} = new Balance(balance);
    return new Balance(this.bnRaw.mul(bnRaw));
  };

  div = (balance?: BalanceConstructor) => {
    if (!balance) {
      return this;
    }
    const {bnRaw} = new Balance(balance);
    return new Balance(this.bnRaw.div(bnRaw));
  };
}
