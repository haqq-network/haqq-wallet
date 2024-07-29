import {useEffect, useRef, useState} from 'react';

import validate from 'validate.js';

import {app} from '@app/contexts';
import {getRemoteBalanceValue} from '@app/helpers/get-remote-balance-value';
import {I18N, getText} from '@app/i18n';
import {Balance} from '@app/services/balance';

export function useSumAmount(
  initialSum = Balance.Empty,
  initialMaxSum = Balance.Empty,
  initialMinAmount = getRemoteBalanceValue('transfer_min_amount'),
  customCheck?: (amount: Balance) => string,
  onChange?: (amount: Balance, formattedString: string) => void,
) {
  const [{amount, amountText, changed}, setAmount] = useState({
    amount: initialSum,
    amountText: initialSum.isPositive() ? initialSum.toString() : '',
    changed: false,
  });
  const [maxAmount, setMaxAmount] = useState(initialMaxSum);
  const maxAmountRef = useRef(initialMaxSum);
  const [minAmount, setMinAmount] = useState(initialMinAmount);
  const minAmountRef = useRef(initialMinAmount);

  useEffect(() => {
    setMaxAmount(initialMaxSum);
  }, [initialMaxSum]);

  const [error, setError] = useState('');

  useEffect(() => {
    if (amount && changed) {
      if (typeof customCheck === 'function') {
        const result = customCheck(amount);
        setError(result);
      } else {
        const errorArray = validate.single(amount.toFloat(), {
          numericality: {
            notValid: 'Invalid number',
            greaterThanOrEqualTo: minAmountRef.current.toFloat(),
            lessThanOrEqualTo: maxAmountRef.current.toFloat(),
            notGreaterThan: getText(I18N.sumAmountTooLow, {
              amount: maxAmountRef.current.toBalanceString('auto'),
            }),
            notLessThanOrEqualTo: getText(I18N.sumAmountNotEnough, {
              symbol: maxAmountRef.current.getSymbol(),
            }),
          },
        });
        const newString = errorArray?.length > 0 ? errorArray.join(' ') : '';
        setError(
          newString
            .replace(app.provider.denom, maxAmountRef.current.getSymbol())
            .replace(
              maxAmountRef.current.toFloat(),
              maxAmountRef.current.toBalanceString('auto'),
            )
            .replace(
              minAmountRef.current.toFloat(),
              minAmountRef.current.toBalanceString('auto'),
            ),
        );
      }
    }
  }, [changed, amount, minAmount, maxAmount]);

  return {
    isValid:
      amount.toEther() >= minAmountRef.current?.toEther?.() &&
      amount.toEther() <= maxAmountRef?.current.toEther?.() &&
      !error,
    maxAmount: maxAmount,
    amount: amountText,
    error,
    setMaxAmount(value = Balance.Empty) {
      maxAmountRef.current = value;
      setMaxAmount(value);
    },
    setMinAmount(value = Balance.Empty) {
      Logger.log('setMinAmount', value);
      minAmountRef.current = value;
      setMinAmount(value);
    },
    setMax() {
      Logger.log('set max', maxAmountRef.current);

      setAmount(({changed: _changed}) => ({
        amountText:
          maxAmountRef?.current?.toFloatString?.() ||
          maxAmount?.toFloatString?.(),
        amount: maxAmountRef?.current || maxAmount,
        changed: _changed,
      }));
    },
    setMin: () => {
      Logger.log('set min', minAmountRef.current);
      setAmount(({changed: _changed}) => ({
        amountText:
          minAmountRef?.current?.toFloatString?.() ||
          minAmount?.toFloatString?.(),
        amount: minAmountRef?.current || minAmount,
        changed: _changed,
      }));
    },
    setAmount(text: string, precision = app.provider.decimals) {
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
          .replace(/^0[0-9]/gm, '0');

        const newAmount = new Balance(+textFormatted, precision);
        if (typeof onChange === 'function') {
          onChange(newAmount, textFormatted);
        }
        setAmount({
          amountText: textFormatted,
          amount: newAmount,
          changed: true,
        });
      } else if (text === '') {
        if (typeof onChange === 'function') {
          onChange(Balance.Empty, '0');
        }
        setAmount({
          amountText: '',
          amount: Balance.Empty,
          changed: true,
        });
      }
    },
    setError,
  };
}
