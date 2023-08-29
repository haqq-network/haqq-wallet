import Decimal from 'decimal.js';

import {Balance} from '@app/services/balance';
import {CURRENCY_NAME, WEI} from '@app/variables/common';

const randomNumber = (
  min: number = Number.MIN_SAFE_INTEGER / 2,
  max: number = Number.MAX_SAFE_INTEGER / 2,
) => {
  return Math.ceil(Math.random() * (max - min) + min);
};

const randomPositiveNumber = () => randomNumber(1, Number.MAX_SAFE_INTEGER / 2);
const randomNegativeNumber = () =>
  randomNumber(Number.MIN_SAFE_INTEGER / 2, -1);

describe('Balance Test Suite', () => {
  describe('constructor cases', () => {
    it('should handle hex string with prefix "0x"', () => {
      const hex = '0xd1ef0632f5aad553e';
      const balance = new Balance(hex);
      expect(balance.toNumber()).toEqual(parseInt(hex, 16));
    });
    it('should handle hex string without prefix', () => {
      const hex = 'd1ef0632f5aad553e';
      const balance = new Balance(hex);
      expect(balance.toNumber()).toEqual(parseInt(hex, 16));
    });
    it('should not handle number string', () => {
      const numberString = '123.456';
      const balance = new Balance(numberString);
      const expected = '0x' + numberString;
      expect(balance.toNumber()).not.toEqual(parseInt(numberString, 10));
      expect(balance.toNumber()).not.toEqual(parseInt(expected, 16));
    });
    it('should handle number', () => {
      const number = 123.456;
      const balance = new Balance(number);
      expect(balance.toNumber()).toEqual(number * WEI);
    });
    it('should handle empty balance instance', () => {
      const balance = new Balance(Balance.Empty);
      expect(balance.toNumber()).toEqual(Balance.Empty.toNumber());
    });
    it('should handle non-empty balance instance', () => {
      const number = new Balance(1);
      const balance = new Balance(number);
      expect(balance.toNumber()).toEqual(number.toNumber());
    });
    it('should handle decimal instance', () => {
      const decimal = new Decimal(1.23);
      const balance = new Balance(decimal);
      expect(balance.toNumber()).toEqual(decimal.toNumber());
    });
  });
  describe('method cases', () => {
    describe('.raw', () => {
      it('should return valid raw referrence', () => {
        const decimal = new Decimal(randomPositiveNumber());
        const balance = new Balance(decimal);
        expect(balance.raw).toEqual(decimal);
      });
    });
    describe('.toNumber()', () => {
      it('should return valid number', () => {
        const hex = '0xd1ef0632f5aad553e';
        const balance = new Balance(hex);
        expect(balance.toNumber()).toEqual(parseInt(hex, 16));
      });
    });
    describe('.toFloat()', () => {
      it('should return a valid number (hex)', () => {
        const hex = '0xd1ef0632f5aad553e';
        const balance = new Balance(hex);
        expect(balance.toFloat()).toEqual(parseInt(hex, 16) / WEI);
      });
      it('should return a valid number (number)', () => {
        const number = randomNumber();
        const balance = new Balance(number);
        expect(balance.toFloat()).toEqual(number);
      });
      it('should return a valid number (balance)', () => {
        const random = randomNumber();
        const number = new Balance(random);
        const balance = new Balance(number);
        expect(balance.toFloat()).toEqual(random);
      });
      it('should return a valid number (decimal)', () => {
        const decimal = new Decimal(1.23);
        const balance = new Balance(decimal);
        expect(balance.toFloat()).toEqual(decimal.toNumber() / WEI);
      });
    });
    describe('.toFloatString()', () => {
      it('should return a valid string (long)', () => {
        const hex = '0xd1ef0632f5aad553e';
        const balance = new Balance(hex);
        const hexString = '242.0370638288085';
        expect(balance.toFloatString()).not.toEqual(
          Number(hexString).toFixed(3),
        );
        expect(balance.toFloatString()).toEqual(hexString.slice(0, 6));
      });
      it('should return a valid string (short)', () => {
        const hex = '0x7C5850872380000';
        const balance = new Balance(hex);
        const hexString = '0.567';
        expect(balance.toFloatString()).not.toEqual(
          Number(hexString).toFixed(2),
        );
        expect(balance.toFloatString()).toEqual(hexString.slice(0, 4));
      });
    });
    describe('.toBalanceString()', () => {
      it('should return a valid balance string (long)', () => {
        const hex = '0xd1ef0632f5aad553e';
        const balance = new Balance(hex);
        const hexString = '242.0370638288085';
        expect(balance.toBalanceString()).toEqual(
          hexString.slice(0, 6) + ' ' + CURRENCY_NAME,
        );
      });
      it('should return a valid balance string (short)', () => {
        const hex = '0x7C5850872380000';
        const balance = new Balance(hex);
        const hexString = '0.567';

        expect(balance.toBalanceString()).toEqual(
          hexString.slice(0, 4) + ' ' + CURRENCY_NAME,
        );
      });
    });
    describe('.toString()', () => {
      it('should return a valid string', () => {
        const hex = '0xd1ef0632f5aad553e';
        const balance = new Balance(hex);
        const hexString = '242037063828808488254';
        expect(balance.toString()).toEqual(hexString);
      });
    });
    describe('.toHex()', () => {
      it('should return a valid hex string (string)', () => {
        const number = new Decimal('242037063828808488254');
        const balance = new Balance(number);
        const hex = '0xd1ef0632f5aad553e';
        expect(balance.toHex()).toEqual(hex);
      });
      it('should return a valid hex string (long number with rounding error!)', () => {
        const number = new Decimal(242037063828808488254);
        const balance = new Balance(number);
        const hex = '0xd1ef0632f5aad8320';
        expect(balance.toHex()).toEqual(hex);
      });
      it('should return a valid hex string (positive short number)', () => {
        const random = randomPositiveNumber();
        const number = new Decimal(random);
        const balance = new Balance(number);
        const hex = '0x' + random.toString(16);
        expect(balance.toHex()).toEqual(hex);
      });
      it('should return a valid hex string (negative short number)', () => {
        const random = randomNegativeNumber();
        const number = new Decimal(random);
        const balance = new Balance(number);
        const hex = '-0x' + Math.abs(random).toString(16);
        expect(balance.toHex()).toEqual(hex);
      });
    });
    describe('.isPositive()', () => {
      it('should return a valid answer (negative)', () => {
        const balance = new Balance(-1);
        expect(balance.isPositive()).toEqual(false);
      });
      it('should return a valid answer (positive)', () => {
        const balance = new Balance(+1);
        expect(balance.isPositive()).toEqual(true);
      });
      it('should return a valid answer (zero)', () => {
        const balance = new Balance(0);
        expect(balance.isPositive()).toEqual(false);
      });
    });
    describe('.operate()', () => {
      describe('Empty', () => {
        it('should return existing instance in case of missing value', () => {
          const balance = new Balance(1);
          expect(balance.operate(undefined, 'add')).toEqual(balance);
          expect(balance.operate(null, 'add')).toEqual(balance);
          expect(balance.operate(NaN, 'add')).toEqual(balance);
          expect(balance.operate('', 'add')).toEqual(balance);
          expect(balance.operate(0, 'div')).toEqual(balance);
          expect(balance.operate(0, 'mul')).toEqual(balance);
        });
      });
      describe('Decimals', () => {
        it('should return a valid answer (add)', () => {
          const first = new Decimal(String(randomNumber()));
          const second = new Decimal(String(randomNumber()));

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first).add(second);
          const expected = firstBalance.operate(secondBalance, 'add').raw;
          expect(expected).toEqual(result);
        });
        it('should return a valid answer (mul)', () => {
          const first = new Decimal(String(randomNumber()));
          const second = new Decimal(String(randomNumber()));

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first).mul(second);
          const expected = firstBalance.operate(secondBalance, 'mul').raw;
          expect(expected).toEqual(result);
        });
        it('should return a valid answer (div)', () => {
          const first = new Decimal(String(randomNumber()));
          const second = new Decimal(String(randomNumber()));

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first).div(second);
          expect(firstBalance.operate(secondBalance, 'div').raw).toEqual(
            result,
          );
        });
        it('should return a valid answer (sub)', () => {
          const first = new Decimal(String(randomNumber()));
          const second = new Decimal(String(randomNumber()));

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first).sub(second);
          expect(firstBalance.operate(secondBalance, 'sub').raw).toEqual(
            result,
          );
        });
      });
      describe('Strings', () => {
        it('should return a valid answer (add)', () => {
          const first = '0x' + String(randomPositiveNumber().toString(16));
          const second = '0x' + String(randomPositiveNumber().toString(16));

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first).add(second);
          const expected = firstBalance.operate(secondBalance, 'add').raw;
          expect(expected).toEqual(result);
        });
        it('should return a valid answer (mul)', () => {
          const first = '0x' + String(randomPositiveNumber().toString(16));
          const second = '0x' + String(randomPositiveNumber().toString(16));

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first).mul(second);
          const expected = firstBalance.operate(secondBalance, 'mul').raw;
          expect(expected).toEqual(result);
        });
        it('should return a valid answer (div)', () => {
          const first = '0x' + String(randomPositiveNumber().toString(16));
          const second = '0x' + String(randomPositiveNumber().toString(16));

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first).div(second);
          expect(firstBalance.operate(secondBalance, 'div').raw).toEqual(
            result,
          );
        });
        it('should return a valid answer (sub)', () => {
          const first = '0x' + String(randomPositiveNumber().toString(16));
          const second = '0x' + String(randomPositiveNumber().toString(16));

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first).sub(second);
          expect(firstBalance.operate(secondBalance, 'sub').raw).toEqual(
            result,
          );
        });
      });
      describe('Numbers', () => {
        it('should return a valid answer (add)', () => {
          const first = randomNumber();
          const second = randomNumber();

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first * WEI).add(second * WEI);
          const expected = firstBalance.operate(secondBalance, 'add').raw;
          expect(expected).toEqual(result);
        });
        it('should return a valid answer (mul)', () => {
          const first = randomNumber();
          const second = randomNumber();

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first * WEI).mul(second * WEI);
          const expected = firstBalance.operate(secondBalance, 'mul').raw;
          expect(expected).toEqual(result);
        });
        it('should return a valid answer (div)', () => {
          const first = randomNumber();
          const second = randomNumber();

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first * WEI).div(second * WEI);
          expect(firstBalance.operate(secondBalance, 'div').raw).toEqual(
            result,
          );
        });
        it('should return a valid answer (sub)', () => {
          const first = randomNumber();
          const second = randomNumber();

          const firstBalance = new Balance(first);
          const secondBalance = new Balance(second);

          const result = new Decimal(first * WEI).sub(second * WEI);
          expect(firstBalance.operate(secondBalance, 'sub').raw).toEqual(
            result,
          );
        });
      });
    });
    describe('.compare()', () => {
      it('should return a valid answer (eq)', () => {
        const first = new Balance(-1);
        const second = new Balance(1);
        expect(first.compare(second, 'eq')).toEqual(false);
        expect(first.compare(first, 'eq')).toEqual(true);
        expect(first.compare(new Balance(first), 'eq')).toEqual(true);
      });
      it('should return a valid answer (lt)', () => {
        const first = new Balance(-1);
        const second = new Balance(1);
        expect(first.compare(second, 'lt')).toEqual(true);
        expect(first.compare(first, 'lt')).toEqual(false);
        expect(second.compare(first, 'lt')).toEqual(false);
      });
      it('should return a valid answer (lte)', () => {
        const first = new Balance(-1);
        const second = new Balance(1);
        expect(first.compare(second, 'lte')).toEqual(true);
        expect(first.compare(first, 'lte')).toEqual(true);
        expect(second.compare(first, 'lte')).toEqual(false);
      });
      it('should return a valid answer (gt)', () => {
        const first = new Balance(-1);
        const second = new Balance(1);
        expect(first.compare(second, 'gt')).toEqual(false);
        expect(first.compare(first, 'gt')).toEqual(false);
        expect(second.compare(first, 'gt')).toEqual(true);
      });
      it('should return a valid answer (gte)', () => {
        const first = new Balance(-1);
        const second = new Balance(1);
        expect(first.compare(second, 'gte')).toEqual(false);
        expect(first.compare(first, 'gte')).toEqual(true);
        expect(second.compare(first, 'gte')).toEqual(true);
      });
    });
    describe('.toWeiString()', () => {
      it('should return a valid balance string (long)', () => {
        const balance = new Balance(5000 / WEI);
        expect(balance.toWeiString()).toEqual('5000 a' + CURRENCY_NAME);
      });
    });
  });
});
