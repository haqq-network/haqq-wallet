import Decimal from 'decimal.js';
import {BigNumber, BigNumberish} from 'ethers';

import {cleanNumber} from '@app/helpers/clean-number';
import {Currencies} from '@app/models/currencies';
import {
  BalanceConstructor,
  HexNumber,
  IBalance,
  ISerializable,
} from '@app/types';
import {
  CURRENCY_NAME,
  LONG_NUM_PRECISION,
  NUM_DELIMITER,
  NUM_PRECISION,
  WEI_PRECISION,
} from '@app/variables/common';

const zeroBN = new Decimal(0);

export class Balance implements IBalance, ISerializable {
  static readonly Empty = new Balance(zeroBN);
  public originalValue: BalanceConstructor;
  private bnRaw = zeroBN;
  private precission: number;
  private symbol: string;

  constructor(
    balance: BalanceConstructor,
    precission = WEI_PRECISION,
    symbol = CURRENCY_NAME,
  ) {
    this.originalValue = balance;
    this.precission = precission ?? WEI_PRECISION;
    this.symbol = symbol || CURRENCY_NAME;

    if (BigNumber.isBigNumber(balance)) {
      const {_hex} = BigNumber.from(balance);
      this.bnRaw = new Decimal(_hex);
      return;
    }

    if (Decimal.isDecimal(balance)) {
      this.bnRaw = balance;
      return;
    }

    if (balance instanceof Balance) {
      this.bnRaw = balance.bnRaw as Decimal;
      this.precission = balance.precission;
      this.symbol = balance.symbol;
      return;
    }

    if (typeof balance === 'string') {
      const hasPrefix = balance.includes('0x');
      if (hasPrefix) {
        this.bnRaw = new Decimal(balance);
        return;
      }

      this.bnRaw = new Decimal(balance);
      return;
    }

    if (typeof balance === 'number') {
      this.bnRaw = new Decimal(balance * 10 ** this.precission);
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
   * Is current Balance instance is Islamic Coin
   */
  get isIslamic() {
    return this.symbol === CURRENCY_NAME;
  }

  getPrecission() {
    return this.precission;
  }

  getSymbol() {
    return this.symbol;
  }

  static getEmpty = (precision = WEI_PRECISION, symbol = CURRENCY_NAME) => {
    return new Balance(zeroBN, precision, symbol);
  };

  static fromJsonString = (obj: string | Balance) => {
    const serializedValue: {
      value: HexNumber;
      precision: number;
      symbol: string;
    } = JSON.parse(String(obj));
    return new Balance(
      serializedValue.value,
      serializedValue.precision,
      serializedValue.symbol,
    );
  };

  /**
   * Convert balance to a long integer
   */
  toNumber = () => {
    return this.bnRaw.toNumber();
  };

  /**
   * Convert balance to float according to WEI
   */
  toFloat = (precission: number = this.precission) => {
    const float = this.bnRaw.div(10 ** precission).toNumber();
    return float;
  };

  /**
   * Convert balance to float string according to cleanNumber helper
   * @example 123.45
   */
  toFloatString = (
    fixed = NUM_PRECISION,
    precission: number = this.precission,
  ) => {
    return cleanNumber(this.toFloat(precission), NUM_DELIMITER, fixed);
  };

  /**
   * Convert balance to float string according to cleanNumber helper and append currency name
   * @example 123.45 ISLM
   */
  toBalanceString = (
    fixed: number | 'auto' = NUM_PRECISION,
    precission: number = this.precission,
  ) => {
    let fixedNum = 0;
    if (fixed === 'auto') {
      const float = this.toFloat(precission);
      fixedNum = float > 1 ? NUM_PRECISION : LONG_NUM_PRECISION;
    } else {
      fixedNum = fixed;
    }

    return this.toFloatString(fixedNum, precission) + ` ${this.symbol}`;
  };

  /**
   * Convert balance to float string according to cleanNumber helper and append currency name
   * @example 123.45 ISLM
   */
  toFiatBalanceString = (
    fixed: number | 'auto' = NUM_PRECISION,
    precission: number = this.precission,
  ) => {
    let fixedNum = 0;
    if (fixed === 'auto') {
      const float = this.toFloat(precission);
      fixedNum = float > 1 ? NUM_PRECISION : LONG_NUM_PRECISION;
    } else {
      fixedNum = fixed;
    }

    const getStringWithSymbol = (value: string) => {
      const currency = Currencies.currency;
      const result = [value];
      currency?.prefix && result.unshift(currency.prefix);
      currency?.postfix && result.push(currency.postfix);
      return result.join(' ');
    };

    const floatString = this.toFloatString(fixedNum, precission);
    const isNegative = floatString.startsWith('-');
    if (isNegative) {
      return `- ${getStringWithSymbol(floatString.replace('-', ''))}`;
    }
    return `${getStringWithSymbol(this.toFloatString(fixedNum, precission))}`;
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
    return new Balance(result, this.precission, this.symbol);
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
    return new Balance(result, this.precission, this.symbol);
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
    return new Balance(result, this.precission, this.symbol);
  };

  toEther = () => this.toFloat();

  toEtherString = () => this.toBalanceString();

  toWei = () => this.toNumber();

  toWeiString = () => {
    return this.toWei() + ` a${this.symbol}`;
  };

  toBigNumberish = (): BigNumberish => {
    return BigNumber.from(this.toHex());
  };

  toJsonString = (): string => {
    const serializedValue = {
      value: this.toHex(),
      precision: this.precission,
      symbol: this.symbol,
    };
    return JSON.stringify(serializedValue);
  };

  /**
   * Custom console.log implementation for Hermes engine
   * @returns {string}
   */
  toJSON = (): string => {
    const hex = this.toHex();
    const ether = this.toEtherString();
    const wei = this.toWeiString();
    const precision = this.precission;
    const symbol = this.symbol;
    return `Hex: ${hex}, Ether: ${ether}, Wei: ${wei}, Precision: ${precision}, Symbol: ${symbol}`;
  };

  /**
   * Get current symbol
   */
  get currency() {
    return this.symbol;
  }

  /**
   * Convert balance to fiat currency
   */
  toFiat = (fixed = NUM_PRECISION, precission: number = this.precission) => {
    return Currencies.convert(this).toFiatBalanceString(fixed, precission);
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
      return new Balance(value, this.precission, this.symbol).bnRaw;
    }
  };
}
