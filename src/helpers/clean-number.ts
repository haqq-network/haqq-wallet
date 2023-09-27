import {NUM_DELIMITER, NUM_PRECISION} from '@app/variables/common';

export function cleanNumber(
  number: string | number,
  delimiter = NUM_DELIMITER,
  precision = NUM_PRECISION,
) {
  if (!number) {
    return '0';
  }
  const num = parseFloat(String(number).trim().replace(/ /g, ''));
  let pr = precision;
  if (num < 1 / Math.pow(10, precision)) {
    pr += 1;
  }

  const prec = Math.pow(10, pr);

  const raw = Math.floor(num * prec) / prec;
  const [a, f] = String(raw.toFixed(pr)).split('.');
  const aFormatted = a.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
  const fFormatted = f ? f.replace(/0+$/, '') : '';
  if (!fFormatted) {
    return aFormatted;
  }

  return `${aFormatted}.${fFormatted}`;
}
