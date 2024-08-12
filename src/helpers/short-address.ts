export function shortAddress(
  address: string,
  delimiter: string = '.',
  short = false,
) {
  if (short) {
    return `${delimiter.repeat(3)}${address.slice(
      address.length - 4,
      address.length,
    )}`;
  }

  return `${address.slice(0, 4)}${delimiter.repeat(4)}${address.slice(
    address.length - 4,
    address.length,
  )}`;
}
