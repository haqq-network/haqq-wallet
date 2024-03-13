import React, {forwardRef, useImperativeHandle, useMemo, useState} from 'react';

import {Platform, View} from 'react-native';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {ColorType} from '@app/types';

import {HeaderButton, HeaderButtonProps} from './header-button';
import {SearchLine, SearchLineProps} from './search-line';

import {Text} from '../index';

/**
 * @param onPressRight by default open search input
 */
interface CustomHeaderProps {
  title?: I18N;
  iconLeft?: HeaderButtonProps['icon'];
  textLeft?: HeaderButtonProps['text'];
  i18nTextLeft?: HeaderButtonProps['i18n'];
  onPressLeft?: HeaderButtonProps['onPress'];
  disabledLeft?: HeaderButtonProps['disabled'];
  testIdLeft?: HeaderButtonProps['testID'];
  colorLeft?: ColorType;
  iconRight?: HeaderButtonProps['icon'];
  textRight?: HeaderButtonProps['text'];
  testIdRight?: HeaderButtonProps['testID'];
  i18nTextRight?: HeaderButtonProps['i18n'];
  colorRight?: ColorType;
  onPressRight?: HeaderButtonProps['onPress'];
  disabledRight?: HeaderButtonProps['disabled'];
  onChangeSearch?: SearchLineProps['onChange'];
  testIdSearch?: SearchLineProps['testId'];
}

export type VotingCardDetailRefInterface =
  | {
      startSearch: () => void;
      stopSearch: () => void;
    }
  | undefined;

export const CustomHeader = forwardRef<
  VotingCardDetailRefInterface,
  CustomHeaderProps
>(
  (
    {
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
      onChangeSearch,
      testIdLeft,
      testIdRight,
      testIdSearch,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const frame = useSafeAreaFrame();

    const [isSearching, setIsSearching] = useState(false);

    const stopSearch = () => setIsSearching(false);
    const startSearch = () => setIsSearching(true);

    useImperativeHandle(ref, () => ({
      startSearch,
      stopSearch,
    }));

    const top = useMemo(
      () =>
        Platform.select({
          ios: insets.top - frame.y,
          android: insets.top,
        }),
      [insets, frame],
    );

    return (
      <View style={[styles.container, {marginTop: top}]}>
        {isSearching ? (
          <SearchLine
            onChange={onChangeSearch}
            onCancel={stopSearch}
            testId={testIdSearch}
          />
        ) : (
          <>
            <HeaderButton
              onPress={onPressLeft}
              disabled={disabledLeft}
              color={colorLeft}
              text={textLeft}
              icon={iconLeft}
              i18n={i18nTextLeft}
              testID={testIdLeft || 'go_back'}
            />
            <Text t8 i18n={title} center />
            <HeaderButton
              onPress={onPressRight ?? startSearch}
              disabled={disabledRight}
              color={colorRight}
              text={textRight}
              icon={iconRight}
              i18n={i18nTextRight}
              testID={testIdRight}
            />
          </>
        )}
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
    height: 56,
    flexDirection: 'row',
    zIndex: 1,
    backgroundColor: Color.bg1,
  },
});
