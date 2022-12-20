import {useEffect, useState} from 'react';

import Decimal from 'decimal.js';
import validate from 'validate.js';

import {WEI} from '@app/variables/common';

export function useSumAmount(initialSum = 0, initialMaxSum = 0) {
  const [{amount, amountText}, setAmount] = useState({
    amount: initialSum,
    amountText: initialSum > 0 ? new Decimal(initialSum).toString() : '',
  });
  const [maxAmount, setMaxAmount] = useState(initialMaxSum);

  useEffect(() => {
    setMaxAmount(initialMaxSum - 0.0001);
  }, [initialMaxSum]);

  const [error, setError] = useState('');

  useEffect(() => {
    if (amount) {
      setError(
        validate.single(amount, {
          numericality: {
            notValid: 'Invalid number',
            greaterThanOrEqualTo: 0.0001,
            lessThanOrEqualTo: maxAmount,
            notGreaterThan: 'Should be greater than 0.0001',
            notLessThanOrEqualTo: "You don't have enough funds",
          },
        }),
      );
    }
  }, [amount, maxAmount]);

  const decAmount = new Decimal(amount);

  return {
    isValid:
      decAmount.greaterThan(0.0001) &&
      decAmount.lessThan(new Decimal(maxAmount)) &&
      !error,
    maxAmount: maxAmount,
    amount: amountText,
    error,
    setMaxAmount(value = 0) {
      setMaxAmount(value);
    },
    setMax(fixed = 4) {
      setAmount({
        amountText: (maxAmount - 10 / WEI).toFixed(fixed),
        amount: maxAmount - 10 / WEI,
      });
    },
    setAmount(text: string) {
      if (text.match(/^[0-9].*/)) {
        let i = 0;
        const textFormatted = text
          .replace(/,/g, '.')
          .replace(/[\.\%]/g, function (match) {
            return match === '.' ? (i++ === 0 ? '.' : '') : '';
          })
          .replace(/\D/g, function (match) {
            return match.match(/[.,]/g) ? match : '';
          })
          .replace(/\D&[^.]/g, '')
          .replace(/^0[0-9]/gm, '0')
          .substring(0, 20);

        setAmount({
          amountText: textFormatted,
          amount: +textFormatted,
        });
      } else if (text === '') {
        setAmount({
          amountText: '',
          amount: 0,
        });
      }
    },
  };
}
