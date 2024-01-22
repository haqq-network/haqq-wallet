import {URRegistryDecoder} from '@keystonehq/ur-decoder';
import {UR, UREncoder} from '@ngraveio/bc-ur';

const MAX_FRAGMENT_LENGTH_BYTES = 500;

export class KeystoneUrHelper {
  static createUrEncoder(cborHex: string, urType: string) {
    return new UREncoder(
      new UR(Buffer.from(cborHex, 'hex'), urType),
      MAX_FRAGMENT_LENGTH_BYTES,
    );
  }

  static createUrDecoder() {
    return new URRegistryDecoder();
  }
}
