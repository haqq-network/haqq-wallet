import React from 'react';

import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {createTheme} from '@app/helpers';
import {ColorType} from '@app/types';

import {HeaderButton, HeaderButtonProps} from './header-button';

import {Text} from '../index';

interface CustomHeaderProps {
  title?: string;
  iconLeft?: HeaderButtonProps['icon'];
  textLeft?: HeaderButtonProps['text'];
  onPressLeft?: HeaderButtonProps['onPress'];
  disabledLeft?: HeaderButtonProps['disabled'];
  colorLeft?: ColorType;
  iconRight?: HeaderButtonProps['icon'];
  textRight?: HeaderButtonProps['text'];
  colorRight?: ColorType;
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
  title,
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
      />
      <Text t8 center>
        {title || ''}
      </Text>
      <HeaderButton
        onPress={onPressRight}
        disabled={disabledRight}
        color={colorRight}
        text={textRight}
        icon={iconRight}
      />
    </View>
  );
};

const styles = createTheme({
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
