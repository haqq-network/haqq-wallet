import React from 'react';

import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';

import {HeaderButton, HeaderButtonProps} from './header-button';

import {Text} from '../index';

interface CustomHeaderProps {
  title?: I18N;
  iconLeft?: HeaderButtonProps['icon'];
  textLeft?: HeaderButtonProps['text'];
  i18nTextLeft?: HeaderButtonProps['i18n'];
  onPressLeft?: HeaderButtonProps['onPress'];
  disabledLeft?: HeaderButtonProps['disabled'];
  colorLeft?: Color;
  iconRight?: HeaderButtonProps['icon'];
  textRight?: HeaderButtonProps['text'];
  i18nTextRight?: HeaderButtonProps['i18n'];
  colorRight?: Color;
  onPressRight?: HeaderButtonProps['onPress'];
  disabledRight?: HeaderButtonProps['disabled'];
}

export const CustomHeader = ({
  onPressLeft,
  onPressRight,
  disabledLeft,
  disabledRight,
  colorLeft,
  colorRight,
  iconLeft,
  iconRight,
  textLeft,
  textRight,
  title = I18N.empty,
  i18nTextRight,
  i18nTextLeft,
}: CustomHeaderProps) => {
  const {top} = useSafeAreaInsets();

  return (
    <View style={[styles.container, {marginTop: top}]}>
      <HeaderButton
        onPress={onPressLeft}
        disabled={disabledLeft}
        color={colorLeft}
        text={textLeft}
        icon={iconLeft}
        i18n={i18nTextLeft}
      />
      <Text t8 i18n={title} center />
      <HeaderButton
        onPress={onPressRight}
        disabled={disabledRight}
        color={colorRight}
        text={textRight}
        icon={iconRight}
        i18n={i18nTextRight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
    height: 56,
    flexDirection: 'row',
    zIndex: 1,
  },
});
