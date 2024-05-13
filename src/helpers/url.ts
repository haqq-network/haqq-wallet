import Url from 'url-parse';

import {onDeepLink} from '@app/event-actions/on-deep-link';
import {openWeb3Browser} from '@app/utils';

export const openURL = (url: string) => {
  if (url.startsWith('haqq:')) {
    const isHandled = onDeepLink(url);
    if (!isHandled) {
      openWeb3Browser(url);
    }
  } else {
    openWeb3Browser(url);
  }
};

export {Url};
