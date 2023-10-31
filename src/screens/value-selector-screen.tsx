import React, {useCallback, useRef} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {ValueSelector} from '@app/components/value-selector';
import {app} from '@app/contexts';
import {createTheme, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';

const ValueSelectorStack = createNativeStackNavigator();

const screenOptions = {
  ...popupScreenOptions,
  keyboardHandlingEnabled: false,
  headerRight: DismissPopupButton,
};

export const ValueSelectorScreen = () => {
  const {params} = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.ValueSelector
  >();
  const {title, values, initialIndex = -1, eventSuffix = ''} = params;
  const selectedIndex = useRef(initialIndex);

  useFocusEffect(() => {
    return () => {
      if (selectedIndex.current > -1 && values[selectedIndex.current]) {
        app.emit(`value-selected${eventSuffix}`, selectedIndex.current);
      } else {
        app.emit(`value-selected-reject${eventSuffix}`);
      }
    };
  });

  const onValueSelected = useCallback(
    (index: number) => {
      selectedIndex.current = index;
    },
    [selectedIndex],
  );

  const Component = useCallback(
    () => (
      <ValueSelector
        values={values}
        initialIndex={initialIndex}
        onValueSelected={onValueSelected}
        style={styles.valueSelector}
      />
    ),
    [initialIndex, onValueSelected, values],
  );

  return (
    <ValueSelectorStack.Navigator screenOptions={{...screenOptions, title}}>
      <ValueSelectorStack.Screen name={title} component={Component} />
    </ValueSelectorStack.Navigator>
  );
};

const styles = createTheme({
  valueSelector: {
    marginHorizontal: 20,
  },
});
