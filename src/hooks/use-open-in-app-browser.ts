import {useCallback} from 'react';

import {InAppBrowserOptions, prepareDataForInAppBrowser} from '@app/utils';

import {useTypedNavigation} from './use-typed-navigation';

export const useOpenInAppBrowser = () => {
  const navigation = useTypedNavigation();

  const openInAppBrowser = useCallback(
    (url: string, options?: InAppBrowserOptions) => {
      const {screenName, formattedUrl, title} = prepareDataForInAppBrowser(
        url,
        options,
      );

      navigation.navigate(screenName, {
        url: formattedUrl,
        title,
      });
    },
    [navigation],
  );

  return {openInAppBrowser};
};
