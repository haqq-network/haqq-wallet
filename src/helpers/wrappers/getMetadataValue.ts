import {getMetadataValue} from '@haqq/shared-react-native';
import BN from 'bn.js';

import {ErrorHandler} from '@app/models/errorHandler';

export const getMetadataValueWrapped = async (
  host: string,
  privateKey: string | BN,
  key: string,
) => {
  let result = null;
  try {
    result = await getMetadataValue(host, privateKey, key);
  } catch (err) {
    ErrorHandler.handle('sssLimitReached');
  }
  return result;
};
