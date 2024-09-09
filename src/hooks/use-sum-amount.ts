import {useEffect, useRef, useState} from 'react';

import validate from 'validate.js';

import {getRemoteBalanceValue} from '@app/helpers/get-remote-balance-value';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Balance} from '@app/services/balance';

export const useSumAmount = (
  initialSum = Balance.Empty,
  initialMaxSum = Balance.Empty,
  initialMinAmount = getRemoteBalanceValue('transfer_min_amount'),
  customCheck?: (amount: Balance) => string,
  onChange?: (amount: Balance, formattedString: string) => void,
) => {
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
            notGreaterThanOrEqualTo: getText(I18N.sumAmountTooLow, {
              amount: minAmountRef.current.toBalanceString('auto'),
            }),
            lessThanOrEqualTo: maxAmountRef.current.toFloat(),
            notLessThanOrEqualTo: getText(I18N.sumAmountNotEnough, {
              symbol: maxAmountRef.current.getSymbol(),
            }),
          },
        });
        const newString = errorArray?.length > 0 ? errorArray.join(' ') : '';
        setError(
          newString
            .replace(
              Provider.selectedProvider.denom,
              maxAmountRef.current.getSymbol(),
            )
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
  }, [changed, amount, minAmount, maxAmount, Provider.selectedProvider.denom]);

  return {
    isValid:
      amount.toEther() >= minAmountRef.current?.toEther?.() &&
      amount.toEther() <= maxAmountRef?.current.toEther?.() &&
      !error,
    maxAmount: maxAmount,
    amount: amountText,
    amountBalance: amount,
    error,
    setMaxAmount(value = Balance.Empty) {
      maxAmountRef.current = value;
      setMaxAmount(value);
    },
    setMinAmount(value = Balance.Empty) {
      minAmountRef.current = value;
      setMinAmount(value);
    },
    setMax() {
      const max = maxAmountRef.current ?? maxAmount;
      setAmount(({changed: _changed}) => ({
        amountText: max
          ?.toBalanceString('auto', undefined, false)
          ?.split(max.getSymbol())?.[0]
          ?.trim(),
        amount: max,
        changed: _changed,
      }));
    },
    setMin: () => {
      const min = minAmountRef.current ?? minAmount;
      setAmount(({changed: _changed}) => ({
        amountText: min
          ?.toBalanceString('auto', undefined, false)
          ?.split(min.getSymbol())?.[0]
          ?.trim(),
        amount: min,
        changed: _changed,
      }));
    },
    setAmount(text: string, precision?: number) {
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

        const decimals =
          precision ??
          maxAmountRef.current?.getPrecission?.() ??
          minAmountRef.current?.getPrecission?.() ??
          Provider.selectedProvider.decimals;

        const denom =
          maxAmountRef.current?.getSymbol?.() ??
          minAmountRef.current?.getSymbol?.() ??
          Provider.selectedProvider.denom;

        const newAmount = new Balance(+textFormatted, decimals, denom);
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
};
