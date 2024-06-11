import {Alert, Linking} from 'react-native';

import {openInAppBrowser} from '@app/utils';

export const openURL = async (url: string) => {
  const isWebLink = /^http/.test(url?.trim?.());

  if (isWebLink) {
    return openInAppBrowser(url);
  }

  // Checking if the link is supported for links with custom URL scheme.
  const openAlert = () => {
    Alert.alert('Sorry, We could not open that link:', url);
  };
  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened by some browser in the mobile
      await Linking.openURL(url);
    } else {
      openAlert();
    }
  } catch (error) {
    openAlert();
    Logger.captureException(error, 'openURL');
  }
};
