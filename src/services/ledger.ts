export const CLA = 0x55;
export const INS = {
  GET_VERSION: 0x00,
  INS_PUBLIC_KEY_SECP256K1: 0x01, // Obsolete
  SIGN_SECP256K1: 0x02,
  GET_ADDR_SECP256K1: 0x04,
};

export const P1_VALUES = {
  ONLY_RETRIEVE: 0x00,
  SHOW_ADDRESS_IN_DEVICE: 0x01,
};

export const ERROR_CODE = {
  NoError: 0x9000,
};

export function serializePath(path: number[]) {
  if (!path || path.length !== 5) {
    throw new Error('Invalid path.');
  }

  const buf = Buffer.alloc(20);
  buf.writeUInt32LE(0x80000000 + path[0], 0);
  buf.writeUInt32LE(0x80000000 + path[1], 4);
  buf.writeUInt32LE(0x80000000 + path[2], 8);
  buf.writeUInt32LE(path[3], 12);
  buf.writeUInt32LE(path[4], 16);

  return buf;
}

export function serializeHRP(hrp: string) {
  if (hrp == null || hrp.length < 3 || hrp.length > 83) {
    throw new Error('Invalid HRP');
  }
  const buf = Buffer.alloc(1 + hrp.length);
  buf.writeUInt8(hrp.length, 0);
  buf.write(hrp, 1);
  return buf;
}
