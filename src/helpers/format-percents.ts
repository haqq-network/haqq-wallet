export function formatPercents(value: string | undefined, precision = 0) {
  return (parseFloat(value ?? '0') * 100).toFixed(precision);
}
