import {useEffect} from 'react';

import {StatusBar} from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';

import {useTheme} from '@app/hooks';
import {IS_ANDROID} from '@app/variables/common';

export const useAndroidSystemColors = () => {
  const {colors} = useTheme();
  useEffect(() => {
    const activeColor = colors.graphicGreen2;
    const defaultColor = colors.bg1;

    if (IS_ANDROID) {
      StatusBar.setBackgroundColor(activeColor);
      SystemNavigationBar.setNavigationColor(activeColor);
      return () => {
        SystemNavigationBar.setNavigationColor(defaultColor);
        StatusBar.setBackgroundColor(defaultColor);
      };
    }
  }, [colors]);
};
