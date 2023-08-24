import Decimal from 'decimal.js';

import {cleanNumber} from '@app/helpers';
import {BalanceConstructor, IBalance} from '@app/types';
import {CURRENCY_NAME, WEI} from '@app/variables/common';

const zeroBN = new Decimal(0);

export class Balance implements IBalance {
  static readonly Empty = new Balance(zeroBN);
  private bnRaw = zeroBN;

  constructor(balance: BalanceConstructor) {
    if (balance instanceof Balance) {
      this.bnRaw = balance.bnRaw as Decimal;
      return;
    }

    if (typeof balance === 'string') {
      if (balance.startsWith('0x')) {
        this.bnRaw = new Decimal(balance);
      } else {
        this.bnRaw = new Decimal('0x' + balance);
      }
      return;
    }

    if (typeof balance === 'number') {
      this.bnRaw = new Decimal(balance * WEI);
      return;
    }

    this.bnRaw = balance as Decimal;
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
    return this.bnRaw.toNumber();
  };

  /**
   * Convert balance to float according to WEI
   */
  toFloat = () => {
    const float = new Decimal(this.bnRaw).div(WEI).toNumber();
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
    return this.bnRaw.toHex();
  };

  /**
   * Is balance has money (grater than zero)
   */
  isPositive = () => {
    return this.bnRaw.gt(zeroBN);
  };

  /**
   * Math operations for Balance class
   * @param {(BalanceConstructor | undefined | null)} value Balance instance
   * @param {('add' | 'mul' | 'div' | 'sub')} operation Type of the operation
   * @returns {Balance} new Balance instance
   */
  operate = (
    value: BalanceConstructor | undefined | null,
    operation: 'add' | 'mul' | 'div' | 'sub',
  ) => {
    if (!value) {
      return this;
    }
    const {bnRaw} = new Balance(value);
    const result = new Decimal(this.bnRaw)[operation](bnRaw.toHex());
    return new Balance(result);
  };

  /**
   * Boolean logic operations for Balance class
   * @param {(BalanceConstructor | undefined | null)} value Balance instance
   * @param {('eq' | 'lt' | 'lte' | 'gt' | 'gte')} operation Type of the operation
   * @returns {*} Logical result
   */
  compare = (
    value: BalanceConstructor | undefined | null,
    operation: 'eq' | 'lt' | 'lte' | 'gt' | 'gte',
  ) => {
    if (!value) {
      return false;
    }
    const {bnRaw} = new Balance(value);
    return this.bnRaw[operation](bnRaw);
  };
}

export const MIN_AMOUNT = new Balance(0.001);
export const FEE_AMOUNT = new Balance(0.00001);
