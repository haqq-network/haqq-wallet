import {Platform} from 'react-native';

import {Language} from '@app/models/language';
import {getAppVersion} from '@app/services/version';

export const getAppHeaders = (browserType: 'inapp' | 'web3') => {
  return {
    'X-App-Name': 'haqq-wallet',
    'X-App-Version': getAppVersion(),
    'X-App-Platform': Platform.OS,
    'X-App-Browser': browserType,
    'Accept-Language': Language.current,
  };
};
