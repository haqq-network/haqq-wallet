import {NUM_PRECISION} from '@app/variables/common';

export function cleanNumber(number: string | number, delimiter = ' ') {
  const num = parseFloat(String(number).trim().replace(/ /g, ''));
  let precision = NUM_PRECISION;
  if (num < 1 / Math.pow(10, NUM_PRECISION)) {
    precision += 1;
  }

  const prec = Math.pow(10, precision);

  const raw = Math.floor(num * prec) / prec;
  const [a, f] = String(raw.toFixed(precision)).split('.');
  const aFormatted = a.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
  return `${aFormatted}.${f}`;
}
