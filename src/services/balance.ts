import Decimal from 'decimal.js';
import {BigNumber, BigNumberish} from 'ethers';
import {I18nManager} from 'react-native';

import {cleanNumber} from '@app/helpers/clean-number';
import {Currencies} from '@app/models/currencies';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {
  BalanceConstructor,
  BalanceData,
  ChainId,
  HaqqEthereumAddress,
  HexNumber,
  IBalance,
  ISerializable,
} from '@app/types';
import {formatNumberString} from '@app/utils';
import {
  LONG_NUM_PRECISION,
  NUM_DELIMITER,
  NUM_PRECISION,
  STRINGS,
} from '@app/variables/common';

const zeroBN = new Decimal(0);

export class Balance implements IBalance, ISerializable {
  public originalValue: BalanceConstructor;
  private bnRaw = zeroBN;
  private precission: number;
  private symbol: string;

  static get Empty() {
    return new Balance(
      zeroBN,
      Provider.selectedProvider.decimals,
      Provider.selectedProvider.denom,
    );
  }

  constructor(
    balance: BalanceConstructor,
    precission?: number,
    symbol?: string,
  ) {
    this.originalValue = balance;
    this.precission = precission ?? Provider.selectedProvider.decimals;
    this.symbol = symbol || Provider.selectedProvider.denom;

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
   * Is current Balance instance is native network Coin
   */
  get isNativeCoin() {
    return this.symbol === Provider.selectedProvider.denom;
  }

  getPrecission() {
    return this.precission;
  }

  getSymbol() {
    return this.symbol;
  }

  getWeiSymbol() {
    return `a${this.symbol}`;
  }

  static getEmpty = (precision?: number, symbol?: string) => {
    return new Balance(
      zeroBN,
      precision ?? Provider.selectedProvider.decimals,
      symbol ?? Provider.selectedProvider.denom,
    );
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
    useZeroFormatter = true,
  ) => {
    const float = this.toFloat(precission);
    if (float < 1 && useZeroFormatter) {
      return formatNumberString(
        this.bnRaw.div(10 ** precission).toFixed(),
        fixed,
      );
    }
    return cleanNumber(this.toFloat(precission), NUM_DELIMITER, fixed);
  };

  /**
   * Convert balance to float string according to cleanNumber helper and append currency name
   * @example 123.45 ISLM
   */
  toBalanceString = (
    fixed: number | 'auto' = NUM_PRECISION,
    precission: number = this.precission,
    useZeroFormatter = true,
    withoutSymbol = false,
  ) => {
    let fixedNum = 0;
    if (fixed === 'auto') {
      const float = this.toFloat(precission);
      fixedNum = float > 1 ? NUM_PRECISION : LONG_NUM_PRECISION;
    } else {
      fixedNum = fixed;
    }

    if (withoutSymbol) {
      return this.toFloatString(fixedNum, precission, useZeroFormatter).trim();
    }

    if (!this.symbol) {
      return this.getStringWithSymbol(
        this.toFloatString(fixedNum, precission, useZeroFormatter),
      );
    }

    const isRTL = I18nManager.isRTL;
    if (isRTL) {
      return `${this.symbol}${STRINGS.NBSP}${this.toFloatString(
        fixedNum,
        precission,
        useZeroFormatter,
      )}`.trim();
    }
    return `${this.toFloatString(fixedNum, precission, useZeroFormatter)}${
      STRINGS.NBSP
    }${this.symbol}`.trim();
  };

  private getStringWithSymbol = (value: string) => {
    const currency = Currencies.currency;
    const result = [value];
    currency?.prefix && result.unshift(currency.prefix);
    currency?.postfix && result.push(currency.postfix);
    return result.join(STRINGS.NBSP);
  };

  /**
   * Convert balance to float string according to cleanNumber helper and append currency name
   * @example 123.45 ISLM
   */
  toFiatBalanceString = (
    fixed: number | 'auto' = NUM_PRECISION,
    precission: number = this.precission,
    withoutSymbol = false,
  ) => {
    let fixedNum = 0;
    if (fixed === 'auto') {
      const float = this.toFloat(precission);
      fixedNum = float > 1 ? NUM_PRECISION : LONG_NUM_PRECISION;
    } else {
      fixedNum = fixed;
    }

    const floatString = this.toFloatString(fixedNum, precission);
    const isNegative = floatString.startsWith('-');
    if (isNegative) {
      if (withoutSymbol) {
        return `-${STRINGS.NBSP}${floatString.replace('-', '')}`;
      }
      return `-${STRINGS.NBSP}${this.getStringWithSymbol(
        floatString.replace('-', ''),
      )}`;
    }

    if (withoutSymbol) {
      return floatString;
    }
    return `${this.getStringWithSymbol(floatString)}`;
  };

  toString = () => {
    return this.bnRaw.toString();
  };

  toHex = () => {
    return this.bnRaw.toHex().split('.')[0];
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
  toGWei = () => this.toNumber() / Math.pow(10, 9);

  toWeiString = () => {
    const isRTL = I18nManager.isRTL;
    if (isRTL) {
      return `a${this.symbol}${STRINGS.NBSP}${this.toWei()}`;
    }
    return `${this.toWei()}${STRINGS.NBSP}a${this.symbol}`;
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
  toFiat = (props?: {
    fixed?: number | 'auto';
    precission?: number;
    useDefaultCurrency?: boolean;
    chainId?: ChainId;
    withoutSymbol?: boolean;
  }) => {
    const convertedBalance = Currencies.convert(this, props?.chainId);
    const fixed = props?.fixed ?? NUM_PRECISION;
    const precission = props?.precission ?? this.precission;
    const useDefaultCurrency = props?.useDefaultCurrency ?? false;

    if (!convertedBalance.toNumber()) {
      if (useDefaultCurrency) {
        return this.toBalanceString(
          fixed,
          precission,
          undefined,
          props?.withoutSymbol,
        );
      }
      return '';
    }

    return convertedBalance.toFiatBalanceString(
      fixed,
      precission,
      props?.withoutSymbol,
    );
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

  static get emptyBalances(): Record<HaqqEthereumAddress, BalanceData> {
    return Wallet.getAll().reduce((acc, w) => {
      return {
        ...acc,
        [w.address]: {
          staked: Balance.Empty,
          vested: Balance.Empty,
          available: Balance.Empty,
          total: Balance.Empty,
          locked: Balance.Empty,
          availableForStake: Balance.Empty,
          unlock: new Date(0),
        },
      };
    }, {});
  }
}
