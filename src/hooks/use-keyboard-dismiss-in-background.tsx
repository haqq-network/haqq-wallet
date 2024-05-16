import {useEffect} from 'react';

import {useAppState} from '@react-native-community/hooks';
import {Keyboard} from 'react-native';

export function useKeyboardDismissInBackground() {
  const appState = useAppState();
  useEffect(() => {
    if (appState === 'background' || appState === 'inactive') {
      Keyboard.dismiss();
    }
  }, [appState]);
}
