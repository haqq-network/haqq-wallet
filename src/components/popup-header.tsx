import React, {useEffect, useMemo} from 'react';

import {NavigationAction} from '@react-navigation/routers';
import {StackHeaderProps} from '@react-navigation/stack';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Icon, IconButton, Text} from './ui';

import {Color} from '../colors';
import {createTheme} from '../helpers/create-theme';
import {DEFAULT_HITSLOP} from '../variables';

export const PopupHeader = ({
  options,
  back,
  navigation,
  route,
}: StackHeaderProps) => {
  const insets = useSafeAreaInsets();

  const canGoBack = useMemo(
    () => back && !options.headerBackHidden,
    [back, options.headerBackHidden],
  );

  useEffect(() => {
    const subscription = (e: {
      preventDefault: () => void;
      data: {action: NavigationAction};
    }) => {
      if (!canGoBack && !e.data.action.source) {
        e.preventDefault();
      }
    };

    navigation.addListener('beforeRemove', subscription);

    return () => {
      navigation.removeListener('beforeRemove', subscription);
    };
  }, [canGoBack, navigation]);

  return (
    <View style={[page.container, options.tab && {marginTop: insets.top}]}>
      {canGoBack ? (
        <IconButton onPress={navigation.goBack} hitSlop={DEFAULT_HITSLOP}>
          <Icon s name="arrowBack" color={getColor(Color.graphicBase1)} />
        </IconButton>
      ) : (
        <View style={page.spacer} />
      )}
      <Text t8 style={page.title}>
        {options.title}
      </Text>
      {options.headerRight ? (
        options.headerRight({navigation, route})
      ) : (
        <View style={page.spacer} />
      )}
    </View>
  );
};

const page = createTheme({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    height: 56,
    flexDirection: 'row',
    zIndex: 1,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    color: Color.textBase1,
  },
  spacer: {
    width: 24,
    height: 24,
  },
});
