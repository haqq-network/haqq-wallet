import React, {useCallback, useEffect, useRef} from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {ValueSelector} from '@app/components/value-selector';
import {app} from '@app/contexts';
import {createTheme, popupScreenOptions} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

const ValueSelectorStack = createStackNavigator();

const screenOptions = {
  ...popupScreenOptions,
  keyboardHandlingEnabled: false,
  headerRight: DismissPopupButton,
};

export const ValueSelectorScreen = () => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'valueSelector'>();
  const {title, values, initialIndex = -1, eventSuffix = ''} = params;
  const selectedIndex = useRef(initialIndex);

  useEffect(() => {
    const onBlur = () => {
      if (selectedIndex.current > -1 && values[selectedIndex.current]) {
        app.emit(`value-selected${eventSuffix}`, selectedIndex.current);
      } else {
        app.emit(`value-selected-reject${eventSuffix}`);
      }
    };

    navigation.addListener('blur', onBlur);
    return () => navigation.removeListener('blur', onBlur);
  }, [eventSuffix, navigation, selectedIndex]);

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
