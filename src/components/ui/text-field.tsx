import React, {memo, useCallback, useEffect, useRef, useState} from 'react';

import {
  LayoutChangeEvent,
  NativeSyntheticEvent,
  Pressable,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextInputFocusEventData,
  TextInputProps,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color, getColor} from '@app/colors';
import {Spacer} from '@app/components/ui/spacer';
import {Text} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {IS_IOS} from '@app/variables/common';

type Props = Omit<TextInputProps, 'placeholder'> & {
  label: I18N;
  placeholder: I18N;
  hint?: I18N | undefined;
  errorText?: string | null;
  errorTextI18n?: I18N | null;
  error?: boolean;
  rightAction?: React.ReactNode;
  multiline?: boolean;
  lines?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TextField: React.FC<Props> = memo(
  ({
    autoFocus = false,
    lines = 1,
    label,
    hint,
    error,
    errorText,
    errorTextI18n,
    value,
    style,
    onBlur,
    onFocus,
    placeholder,
    rightAction,
    multiline,
    ...restOfProps
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const left = useSharedValue(40);
    const height = useSharedValue(lines * 22 + 36);
    const focusAnim = useSharedValue(!value || autoFocus ? 0 : 1);

    const onLayout = useCallback(
      (e: LayoutChangeEvent) => {
        const l = e.nativeEvent.layout.width - 32;
        left.value = ((l * 1.33 - l) / 2) * 0.75;
      },
      [left],
    );

    const onLabel = useCallback(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [inputRef]);

    const onBlurEvent = useCallback(
      (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur],
    );

    const onFocusEvent = useCallback(
      (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      [onFocus],
    );

    const contentSizeChangeEvent = useCallback(
      (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
        height.value =
          Math.max(Math.ceil(e.nativeEvent.contentSize.height), lines * 22) +
          36;
      },
      [lines, height],
    );

    useEffect(() => {
      focusAnim.value = withTiming(isFocused || !!value ? 0 : 1, {
        duration: 150,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }, [value, focusAnim, isFocused]);

    let color = getColor(error ? Color.textRed1 : Color.textBase2);

    const labelAnimStyle = useAnimatedStyle(
      () => ({
        transform: [
          {
            scale: interpolate(focusAnim.value, [0, 1], [1, 1.33]),
          },
          {
            translateY: interpolate(focusAnim.value, [0, 1], [0, 10]),
          },
          {
            translateX: interpolate(focusAnim.value, [0, 1], [0, left.value]),
          },
        ],
      }),
      [left],
    );

    const inputAnimStyle = useAnimatedStyle(() => ({
      height: height.value,
    }));

    return (
      <View onLayout={onLayout} style={style}>
        <Animated.View
          style={[
            styles.container,
            error && styles.containerError,
            inputAnimStyle,
          ]}>
          <View style={styles.inputContainer}>
            <AnimatedPressable style={labelAnimStyle} onPress={onLabel}>
              <Text t14 color={color} i18n={label} />
            </AnimatedPressable>
            {!value && isFocused && (
              <Text
                t11
                color={Color.textBase2}
                style={styles.placeholder}
                i18n={placeholder}
              />
            )}
            <TextInput
              selectionColor={getColor(Color.textGreen1)}
              allowFontScaling={false}
              style={styles.input}
              ref={inputRef}
              placeholderTextColor={getColor(Color.textBase2)}
              {...restOfProps}
              value={value}
              multiline={multiline}
              onContentSizeChange={contentSizeChangeEvent}
              onBlur={onBlurEvent}
              onFocus={onFocusEvent}
              autoFocus={autoFocus}
            />
          </View>
          {rightAction && <View style={styles.sub}>{rightAction}</View>}
        </Animated.View>
        {!!error && (errorText || errorTextI18n) && (
          <>
            <Spacer height={8} />
            <Text
              t14
              i18n={errorTextI18n}
              color={Color.textRed1}
              style={styles.error}>
              {errorText}
            </Text>
          </>
        )}
        {!error && hint && (
          <>
            <Spacer height={8} />
            <Text t14 i18n={hint} style={styles.error} />
          </>
        )}
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Color.bg8,
    flexDirection: 'row',
    flex: 0,
  },
  containerError: {
    backgroundColor: Color.bg7,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: Color.textBase1,
    fontSize: 16,
    minHeight: 28,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
    right: IS_IOS ? 0 : 4.5,
    flex: 1,
  },
  error: {
    marginLeft: 4,
  },
  sub: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
  placeholder: {
    position: 'absolute',
    height: 28,
    top: 18,
  },
});
