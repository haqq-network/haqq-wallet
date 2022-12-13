import {useEffect} from 'react';

import {StatusBar} from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';

import {Color, getColor} from '@app/colors';
import {IS_ANDROID} from '@app/variables';

export const useAndroidSystemColors = () => {
  useEffect(() => {
    const activeColor = getColor(Color.graphicGreen2);
    const defaultColor = getColor(Color.bg1);

    if (IS_ANDROID) {
      StatusBar.setBackgroundColor(activeColor);
      SystemNavigationBar.setNavigationColor(activeColor);
      return () => {
        SystemNavigationBar.setNavigationColor(defaultColor);
        StatusBar.setBackgroundColor(defaultColor);
      };
    }
  }, []);
};
