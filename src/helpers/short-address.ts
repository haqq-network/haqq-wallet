export function shortAddress(
  address: string,
  delimiter: string = '.',
  short = false,
  delimiterCount = 4,
) {
  if (!address) {
    return '';
  }
  if (short) {
    return `${delimiter.repeat(3)}${address.slice(
      address.length - 4,
      address.length,
    )}`;
  }

  return `${address.slice(0, 4)}${delimiter.repeat(
    delimiterCount,
  )}${address.slice(address.length - 4, address.length)}`;
}
