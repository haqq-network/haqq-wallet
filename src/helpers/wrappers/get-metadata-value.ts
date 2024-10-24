import {getMetadataValue} from '@haqq/shared-react-native';
import BN from 'bn.js';

import {app} from '@app/contexts';
import {ErrorHandler} from '@app/models/error-handler';

const logger = Logger.create('getMetadataValueWrapped', {
  enabled: __DEV__ || app.isTesterMode || app.isDeveloper,
});

export const getMetadataValueWrapped = async (
  host: string,
  privateKey: string | BN,
  key: string,
) => {
  logger.log('getMetadataValueWrapped: Starting function', {
    host,
    privateKey,
    key,
  });
  let result = null;
  try {
    logger.log('getMetadataValueWrapped: Calling getMetadataValue', {
      host,
      privateKey,
      key,
    });
    result = await getMetadataValue(host, privateKey, key);
    logger.log('getMetadataValueWrapped: getMetadataValue completed', {result});
  } catch (err) {
    logger.error('getMetadataValueWrapped: Error in getMetadataValue', {err});
    ErrorHandler.handle('sssLimitReached', err);
  }
  logger.log('getMetadataValueWrapped: Returning result', {result});
  return result;
};
