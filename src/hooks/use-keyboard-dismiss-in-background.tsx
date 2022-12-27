import {useEffect} from 'react';

import {AppState, AppStateStatus, Keyboard} from 'react-native';

export function useKeyboardDismissInBackground() {
  useEffect(() => {
    const subscription = (status: AppStateStatus) => {
      if (status === 'background' || status === 'inactive') {
        Keyboard.dismiss();
      }
    };

    const sub = AppState.addEventListener('change', subscription);

    return sub.remove;
  }, []);
}
