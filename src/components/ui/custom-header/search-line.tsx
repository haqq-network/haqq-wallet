import React, {useEffect, useRef} from 'react';

import {Platform, TextInput, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';

import {HeaderButton} from './header-button';

import {Icon} from '../icon';
import {Spacer} from '../spacer';

type SearchLineProps = {
  onChange?: (text: string) => void;
  onCancel?: () => void;
};

export function SearchLine({onChange, onCancel}: SearchLineProps) {
  const inputWidth = useSharedValue(0.9);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputWidth.value = withTiming(1, {duration: 200}, () => {
      inputRef.current?.focus();
    });
  }, [inputWidth]);

  const inputAnimation = useAnimatedStyle(() => ({
    flex: inputWidth.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inputContainer, inputAnimation]}>
        <View style={styles.iconContainer}>
          <Icon color={Color.graphicBase2} name="search" i18 />
        </View>
        <TextInput
          style={styles.input}
          selectionColor={getColor(Color.textGreen1)}
          allowFontScaling={false}
          placeholder={' ' + getText(I18N.headerPlaceholderSearch)}
          placeholderTextColor={getColor(Color.graphicBase2)}
          onChangeText={onChange}
        />
      </Animated.View>
      <Spacer width={14} />
      <HeaderButton
        onPress={onCancel}
        color={Color.textGreen1}
        i18n={I18N.cancel}
      />
    </View>
  );
}

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  inputContainer: {
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: Color.bg8,
    flexDirection: 'row',
  },
  input: {
    fontSize: 17,
    lineHeight: 22,
    height: 22,
    flex: 1,
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '400',
      },
      android: {
        fontFamily: 'SF-Pro-Display-Regular',
      },
    }),
  },
});
