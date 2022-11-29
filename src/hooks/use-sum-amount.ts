import {useEffect, useState} from 'react';

import validate from 'validate.js';

export function useSumAmount(
  initialSum: string | number = '',
  initialMaxSum = 0,
) {
  const [amount, setAmount] = useState(String(initialSum));
  const [error, setError] = useState('');
  const [maxAmount, setMaxAmount] = useState(initialMaxSum);

  useEffect(() => {
    if (amount !== '') {
      setError(
        validate.single(amount, {
          numericality: {
            notValid: 'Invalid number',
            greaterThan: 0.0001,
            lessThanOrEqualTo: maxAmount,
            notGreaterThan: 'Should be greater than 0.0001',
            notLessThanOrEqualTo: "You don't have enough funds",
          },
        }),
      );
    }
  }, [amount, maxAmount]);

  return {
    isValid:
      parseFloat(amount) > 0.0001 && parseFloat(amount) < maxAmount && !error,
    maxAmount,
    amount,
    error,
    setMaxAmount(value: number) {
      setMaxAmount(Math.floor(value * 10 ** 4) / 10 ** 4);
    },
    setAmount(value: string | number) {
      setAmount(String(value).replace(/,/g, '.').substring(0, 20));
    },
  };
}
