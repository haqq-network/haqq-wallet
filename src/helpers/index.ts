import {Linking, Alert} from 'react-native';
import * as Sentry from '@sentry/react-native';

export const captureException = (error: unknown) => {
  if (!error) {
    console.log(
      'captureException called with messing or incorrect arguments',
      'background: #555; color: yellow',
    );
    return;
  }
  console.error('captureException', error);
  Sentry.captureException(error);
};

export const openURL = async (url: string) => {
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
    captureException(error);
  }
};
