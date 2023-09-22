import Decimal from 'decimal.js';

import {cleanNumber} from '@app/helpers/clean-number';
import {I18N, getText} from '@app/i18n';
import {BalanceConstructor, IBalance} from '@app/types';
import {
  NUM_DELIMITER,
  NUM_PRECISION,
  WEI_PRECISION,
} from '@app/variables/common';

const zeroBN = new Decimal(0);

export class Balance implements IBalance {
  static readonly Empty = new Balance(zeroBN);
  private bnRaw = zeroBN;
  private _precission: number;

  constructor(balance: BalanceConstructor, precission = WEI_PRECISION) {
    this._precission = precission;
    if (Decimal.isDecimal(balance)) {
      this.bnRaw = balance;
      return;
    }

    if (balance instanceof Balance) {
      this.bnRaw = balance.bnRaw as Decimal;
      return;
    }

    if (typeof balance === 'string') {
      const hasPrefix = balance.includes('0x');
      if (hasPrefix) {
        this.bnRaw = new Decimal(balance);
        return;
      }

      const isNegative = balance.startsWith('-');
      this.bnRaw = new Decimal(
        (isNegative ? '-0x' : '0x') + balance.replace('-', ''),
      );
      return;
    }

    if (typeof balance === 'number') {
      this.bnRaw = new Decimal(balance * 10 ** this._precission);
      return;
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
    return this.bnRaw.toNumber();
  };

  /**
   * Convert balance to float according to WEI
   */
  toFloat = (precission: number = this._precission) => {
    const float = this.bnRaw.div(10 ** precission).toNumber();
    return float;
  };

  /**
   * Convert balance to float string according to cleanNumber helper
   * @example 123.45
   */
  toFloatString = (
    fixed = NUM_PRECISION,
    precission: number = this._precission,
  ) => {
    return cleanNumber(this.toFloat(precission), NUM_DELIMITER, fixed);
  };

  /**
   * Convert balance to float string according to cleanNumber helper and append currency name
   * @example 123.45 ISLM
   */
  toBalanceString = (
    fixed = NUM_PRECISION,
    precission: number = this._precission,
  ) => {
    return getText(I18N.amountISLM, {
      amount: this.toFloatString(fixed, precission),
    });
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
    const bnRaw = this.getBnRaw(value);

    if (!bnRaw) {
      return this;
    }

    const result = this.bnRaw[operation](bnRaw);
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
    const bnRaw = this.getBnRaw(value);

    if (!bnRaw) {
      return false;
    }

    return this.bnRaw[operation](bnRaw);
  };

  /**
   * Return max value of two balances
   * @param {(BalanceConstructor | undefined | null)} value Balance instance
   * @returns Balance instance
   */
  max = (value: BalanceConstructor | undefined | null): Balance => {
    const bnRaw = this.getBnRaw(value);

    if (!bnRaw) {
      return this;
    }

    const result = Decimal.max(this.bnRaw, bnRaw);
    return new Balance(result);
  };

  /**
   * Return min value of two balances
   * @param {(BalanceConstructor | undefined | null)} value Balance instance
   * @returns Balance instance
   */
  min = (value: BalanceConstructor | undefined | null): Balance => {
    const bnRaw = this.getBnRaw(value);

    if (!bnRaw) {
      return this;
    }

    const result = Decimal.min(this.bnRaw, bnRaw);
    return new Balance(result);
  };

  private getBnRaw = (
    value: BalanceConstructor | undefined | null,
  ): Decimal | null => {
    if (!value) {
      return null;
    }

    if (value instanceof Balance) {
      return value.bnRaw;
    } else {
      return new Balance(value).bnRaw;
    }
  };

  toEther = () => this.toFloat();
  toEtherString = () => this.toBalanceString();
  toWei = () => this.toNumber();
  toWeiString = () => {
    return getText(I18N.amountAISLM, {
      amount: String(this.toWei()),
    });
  };
}

export const MIN_AMOUNT = new Balance(0.001);
export const FEE_AMOUNT = new Balance(0.00001);
export const MIN_GAS_LIMIT = new Balance(21_000, 0);
export const BALANCE_MULTIPLIER = new Balance(1.2, 0);
