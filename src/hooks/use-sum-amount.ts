import {useEffect, useRef, useState} from 'react';

import validate from 'validate.js';

import {getRemoteBalanceValue} from '@app/helpers/get-remote-balance-value';
import {I18N, getText} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {WEI_PRECISION} from '@app/variables/common';

export function useSumAmount(
  initialSum = Balance.Empty,
  initialMaxSum = Balance.Empty,
  initialMinAmount = getRemoteBalanceValue('transfer_min_amount'),
  customCheck?: (amount: Balance) => string,
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
            .replace('ISLM', maxAmountRef.current.getSymbol())
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
      Logger.log('setMaxAmount', value);
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
          .substring(
            0,
            (minAmountRef?.current?.getPrecission?.() ||
              maxAmountRef?.current?.getPrecission?.() ||
              WEI_PRECISION) + 1,
          );

        setAmount({
          amountText: textFormatted,
          amount: new Balance(+textFormatted),
          changed: true,
        });
      } else if (text === '') {
        setAmount({
          amountText: '',
          amount: Balance.Empty,
          changed: true,
        });
      }
    },
  };
}
