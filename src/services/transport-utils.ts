export const compressPublicKey = (publicKey: string) => {
  let pk = Buffer.from(
    publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey,
    'hex',
  );

  // eslint-disable-next-line no-bitwise
  let prefix = (pk[64] & 1) !== 0 ? 0x03 : 0x02;
  let prefixBuffer = Buffer.alloc(1);
  prefixBuffer[0] = prefix;
  return Buffer.concat([prefixBuffer, pk.slice(1, 1 + 32)]).toString('hex');
};
