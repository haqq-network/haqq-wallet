import React, {useEffect, useMemo} from 'react';

import {NavigationAction} from '@react-navigation/routers';
import {StackHeaderProps} from '@react-navigation/stack';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color, getColor} from '@app/colors';
import {Icon, IconButton, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {DEFAULT_HITSLOP} from '@app/variables';

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
          <Icon i24 name="arrow_back" color={Color.graphicBase1} />
        </IconButton>
      ) : (
        <View style={page.spacer} />
      )}
      <Text t8 center color={getColor(Color.textBase1)}>
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
  spacer: {
    width: 24,
    height: 24,
  },
});
