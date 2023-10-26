import React, {useEffect, useMemo} from 'react';

import {NavigationAction} from '@react-navigation/routers';
import {StackHeaderProps} from '@react-navigation/stack';
import {Image, ImageSourcePropType, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {GoBackPopupButton} from '@app/components/popup/go-back-popup-button';
import {SpacerPopupButton} from '@app/components/popup/spacer-popup-button';
import {Text} from '@app/components/ui';
import {ScreenOptionType} from '@app/types';
import {IS_ANDROID} from '@app/variables/common';

type PopupHeaderProps = StackHeaderProps & {
  options: ScreenOptionType & {
    customBackFunction?: () => void;
    titleIcon?: ImageSourcePropType;
  };
};

export const PopupHeader = ({options, back, navigation}: PopupHeaderProps) => {
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
    <View
      style={[
        page.container,
        (options.tab || IS_ANDROID) && {marginTop: insets.top},
      ]}>
      {options.headerLeft ? (
        options.headerLeft({})
      ) : canGoBack ? (
        <GoBackPopupButton onBack={options.customBackFunction} />
      ) : (
        <SpacerPopupButton />
      )}
      <View style={page.titleWrapper}>
        {!!options.titleIcon && (
          <Image source={options.titleIcon} style={page.titleIcon} />
        )}
        <Text
          t8
          center
          color={Color.textBase1}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={page.text}>
          {options.title}
        </Text>
      </View>
      {options.headerRight ? options.headerRight({}) : <SpacerPopupButton />}
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    height: 56,
    flexDirection: 'row',
    zIndex: 1,
  },
  text: {
    marginHorizontal: 8,
  },
  titleWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleIcon: {
    height: 18,
    width: 18,
    borderRadius: 5,
  },
});
