import React, {useEffect, useMemo} from 'react';

import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import {NavigationAction} from '@react-navigation/routers';
import {Image, ImageSourcePropType, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {GoBackPopupButton} from '@app/components/popup/go-back-popup-button';
import {SpacerPopupButton} from '@app/components/popup/spacer-popup-button';
import {Text} from '@app/components/ui';
import {Color, createTheme} from '@app/theme';
import {ScreenOptionType} from '@app/types';
import {IS_ANDROID} from '@app/variables/common';

type PopupHeaderProps = NativeStackHeaderProps & {
  options: ScreenOptionType & {
    customBackFunction?: () => void;
    titleIcon?: ImageSourcePropType;
    disableMargin?: boolean;
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
        options.headerStyle,
        page.container,
        !options.disableMargin &&
          (options.tab || IS_ANDROID) && {marginTop: insets.top},
      ]}>
      {options.headerLeft ? (
        options.headerLeft({canGoBack: canGoBack || false})
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
      {options.headerRight ? (
        options.headerRight({canGoBack: canGoBack || false})
      ) : (
        <SpacerPopupButton />
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
    backgroundColor: Color.bg1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
