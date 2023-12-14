import React, {useEffect, useState} from 'react';

import {BlurView} from '@react-native-community/blur';
import {
  AppState,
  NativeEventSubscription,
  Platform,
  StyleSheet,
} from 'react-native';
import {FullWindowOverlay} from 'react-native-screens';

import {IS_ANDROID, IS_IOS} from '@app/variables/common';

export const AppScreenSecurityOverview = () => {
  const [appStateVisible, setAppStateVisible] = useState(true);

  useEffect(() => {
    let iosSubscription: NativeEventSubscription | null = null;
    let androidBlurSubscription: NativeEventSubscription | null = null;
    let androidFocusSubscription: NativeEventSubscription | null = null;

    if (IS_IOS) {
      iosSubscription = AppState.addEventListener('change', nextAppState => {
        setAppStateVisible(nextAppState === 'active');
      });
    }

    // Active/Inactive state for Android
    if (IS_ANDROID) {
      androidBlurSubscription = AppState.addEventListener('blur', () =>
        setAppStateVisible(false),
      );

      androidFocusSubscription = AppState.addEventListener('focus', () =>
        setAppStateVisible(true),
      );
    }

    return () => {
      iosSubscription?.remove();
      androidBlurSubscription?.remove();
      androidFocusSubscription?.remove();
    };
  }, []);

  if (appStateVisible) {
    return null;
  }

  if (Platform.OS === 'ios') {
    return (
      <FullWindowOverlay>
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
      </FullWindowOverlay>
    );
  }

  return (
    <BlurView
      style={StyleSheet.absoluteFillObject}
      blurType="light"
      blurAmount={10}
      reducedTransparencyFallbackColor="white"
    />
  );
};
