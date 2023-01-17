import {BiometryType} from '@app/types';

export const BIOMETRY_TYPES_NAMES: Record<string, string> = {
  [BiometryType.faceId]: 'Face ID',
  [BiometryType.touchId]: 'Touch ID',
  [BiometryType.fingerprint]: 'Fingerprint',
  [BiometryType.unknown]: '',
};
