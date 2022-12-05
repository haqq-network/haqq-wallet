import React from 'react';

import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {ColorType} from '@app/types';

import {HeaderButton, HeaderButtonProps} from './header-button';

import {Text} from '../index';

interface CustomHeaderProps {
  title?: string;
  i18nTitle?: I18N;
  iconLeft?: HeaderButtonProps['icon'];
  textLeft?: HeaderButtonProps['text'];
  i18nTextLeft?: HeaderButtonProps['i18n'];
  onPressLeft?: HeaderButtonProps['onPress'];
  disabledLeft?: HeaderButtonProps['disabled'];
  colorLeft?: ColorType;
  iconRight?: HeaderButtonProps['icon'];
  textRight?: HeaderButtonProps['text'];
  i18nTextRight?: HeaderButtonProps['i18n'];
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
  i18nTitle,
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
      <Text t8 i18n={i18nTitle} center>
        {title || ''}
      </Text>
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
