import {NUM_PRECISION} from '@app/variables/common';

export function cleanNumber(
  number: string | number,
  delimiter = ' ',
  precision = NUM_PRECISION,
) {
  if (!number) {
    return '0';
  }
  const num = parseFloat(String(number).trim().replace(/ /g, ''));
  let pr = precision;
  if (num < 1 / Math.pow(10, NUM_PRECISION)) {
    pr += 1;
  }

  const prec = Math.pow(10, pr);

  const raw = Math.floor(num * prec) / prec;
  const [a, f] = String(raw.toFixed(pr)).split('.');
  const aFormatted = a.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);

  if (!f) {
    return aFormatted;
  }

  return `${aFormatted}.${f}`;
}
