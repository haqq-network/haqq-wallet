import React, {ReactNode, memo, useEffect, useState} from 'react';

import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

type Props = {
  children: ReactNode;
};

export const SecurityView = memo(({children}: Props) => {
  const [appState, setAppState] = useState<AppStateStatus>('active');
  const [inBlur, setBlur] = useState<boolean>(false);

  useEffect(() => {
    let blurHandler: NativeEventSubscription,
      focusHandler: NativeEventSubscription;
    if (Platform.OS === 'android') {
      blurHandler = AppState.addEventListener('blur', () => setBlur(true));
      focusHandler = AppState.addEventListener('focus', () => setBlur(false));
    }
    const appStateHandler = AppState.addEventListener('change', state =>
      setAppState(state),
    );

    return () => {
      if (Platform.OS === 'android') {
        blurHandler.remove();
        focusHandler.remove();
      }
      appStateHandler.remove();
    };
  }, []);

  if (inBlur || appState !== 'active') {
    return null;
  }
  return <View style={styles.wrapper}>{children}</View>;
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
