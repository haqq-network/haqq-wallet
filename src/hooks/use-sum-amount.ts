import {useEffect, useState} from 'react';

import validate from 'validate.js';

import {I18N, getText} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {MIN_AMOUNT} from '@app/variables/common';

export function useSumAmount(
  initialSum = Balance.Empty,
  initialMaxSum = Balance.Empty,
  minAmount = MIN_AMOUNT,
) {
  const [{amount, amountText}, setAmount] = useState({
    amount: initialSum,
    amountText: initialSum.isPositive() ? initialSum.toString() : '',
  });
  const [maxAmount, setMaxAmount] = useState(initialMaxSum);

  useEffect(() => {
    setMaxAmount(initialMaxSum);
  }, [initialMaxSum]);

  const [error, setError] = useState('');

  useEffect(() => {
    if (amount) {
      const errorArray = validate.single(amount.toNumber(), {
        numericality: {
          notValid: 'Invalid number',
          greaterThanOrEqualTo: minAmount.toNumber(),
          lessThanOrEqualTo: maxAmount.toNumber(),
          notGreaterThan: getText(I18N.sumAmountTooLow, {
            amount: maxAmount.toString(),
          }),
          notLessThanOrEqualTo: getText(I18N.sumAmountNotEnough),
        },
      });
      const newString = errorArray?.length > 0 ? errorArray.join(' ') : '';
      setError(newString);
    }
  }, [amount, minAmount, maxAmount]);

  return {
    isValid:
      amount.raw.gte(minAmount.raw) && amount.raw.lte(maxAmount.raw) && !error,
    maxAmount: maxAmount,
    amount: amountText,
    error,
    setMaxAmount(value = Balance.Empty) {
      setMaxAmount(value);
    },
    setMax() {
      const a =
        Math.floor(maxAmount.toNumber() / MIN_AMOUNT.toNumber()) *
        MIN_AMOUNT.toNumber();
      setAmount({
        amountText: String(a),
        amount: maxAmount,
      });
    },
    setAmount(text: string) {
      if (text.match(/^[0-9].*/)) {
        let i = 0;
        const textFormatted = text
          .replace(/,/g, '.')
          .replace(/[.%]/g, function (match) {
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
          amount: new Balance(+textFormatted),
        });
      } else if (text === '') {
        setAmount({
          amountText: '',
          amount: Balance.Empty,
        });
      }
    },
  };
}
