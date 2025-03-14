import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from '@override/react-native-reanimated';
import {
  I18nManager,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  Pressable,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextInputFocusEventData,
  TextInputProps,
  View,
} from 'react-native';
import AnimatedRollingNumber from 'react-native-animated-rolling-numbers';

import {Color, getColor} from '@app/colors';
import {Spacer} from '@app/components/ui/spacer';
import {Text, TextProps, TextVariant} from '@app/components/ui/text';
import {createTheme, showModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {IS_IOS, LONG_NUM_PRECISION} from '@app/variables/common';

import {Button, ButtonSize} from './button';
import {First} from './first';

type InfoBlock = {
  label: string;
  title: I18N;
  description?: I18N;
};

export type TextFieldProps = Omit<TextInputProps, 'placeholder'> & {
  label: I18N | string;
  placeholder?: I18N;
  hint?: I18N | undefined;
  infoBlock?: InfoBlock;
  errorText?: TextProps['children'] | undefined;
  errorTextI18n?: TextProps['i18n'] | undefined;
  error?: boolean;
  rightAction?: React.ReactNode;
  leading?: React.ReactNode;
  multiline?: boolean;
  lines?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TextField: React.FC<TextFieldProps> = memo(
  ({
    autoFocus = false,
    lines = 1,
    label,
    hint,
    infoBlock,
    error,
    errorText,
    errorTextI18n,
    value,
    style,
    onBlur,
    onFocus,
    placeholder,
    rightAction,
    leading,
    multiline,
    numberOfLines,
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
        let nextHeght = Math.max(
          Math.ceil(e.nativeEvent.contentSize.height),
          lines * 22,
        );

        if (numberOfLines) {
          nextHeght = Math.min(nextHeght, numberOfLines * 22);
        }

        height.value = nextHeght + 36;
      },
      [numberOfLines, height, lines],
    );

    useEffect(() => {
      focusAnim.value = withTiming(isFocused || !!value ? 0 : 1, {
        duration: 150,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }, [value, focusAnim, isFocused]);

    const enableAutoFocus = useMemo(() => {
      return autoFocus;
    }, [autoFocus]);

    let color = getColor(error ? Color.textRed1 : Color.textBase2);

    const labelAnimStyle = useAnimatedStyle(
      () => ({
        alignItems: 'flex-start',
        transform: [
          {
            scale: interpolate(focusAnim.value, [0, 1], [1, 1.33]),
          },
          {
            translateY: interpolate(focusAnim.value, [0, 1], [0, 10]),
          },
          {
            translateX: interpolate(
              focusAnim.value,
              [0, 1],
              [0, I18nManager.isRTL ? -left.value : left.value],
            ),
          },
        ],
      }),
      [left],
    );

    const inputAnimStyle = useAnimatedStyle(() => ({
      height: height.value,
    }));
    const valueIsNumber = useMemo(
      function (): boolean {
        if (!value) {
          return false;
        }

        const n = parseFloat(value);
        return !isNaN(n) && typeof n === 'number';
      },
      [value],
    );

    return (
      <View
        onLayout={onLayout}
        style={[!restOfProps.editable && styles.disabled, style]}>
        <Animated.View
          style={[
            styles.container,
            error && styles.containerError,
            inputAnimStyle,
          ]}>
          {leading && <View style={styles.leadingSub}>{leading}</View>}
          <View style={styles.inputContainer}>
            <AnimatedPressable style={labelAnimStyle} onPress={onLabel}>
              {I18N[label as keyof typeof I18N] ? (
                <Text
                  variant={TextVariant.t14}
                  color={color}
                  i18n={label as I18N}
                />
              ) : (
                <Text variant={TextVariant.t14} color={color}>
                  {label}
                </Text>
              )}
            </AnimatedPressable>
            {placeholder && !value && isFocused && (
              <Text
                variant={TextVariant.t11}
                color={Color.textBase2}
                style={styles.placeholder}
                i18n={placeholder}
              />
            )}
            <First>
              {restOfProps.editable === false && valueIsNumber && (
                <AnimatedRollingNumber
                  key={'AnimatedRollingNumber-input-value'}
                  value={value as unknown as number}
                  useGrouping
                  textStyle={[styles.inputRolling, {color: getColor(color)}]}
                  toFixed={
                    String(value).substring(0, LONG_NUM_PRECISION).length
                  }
                  spinningAnimationConfig={{
                    duration: 500,
                    easing: Easing.bounce,
                  }}
                  containerStyle={styles.inputRollingContainer}
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
                numberOfLines={numberOfLines}
                autoFocus={enableAutoFocus}
              />
            </First>
          </View>
          {rightAction && <View style={styles.sub}>{rightAction}</View>}
        </Animated.View>
        {!!error && (errorText || errorTextI18n) && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Spacer height={8} />
            {/* @ts-expect-error */}
            <Text
              variant={TextVariant.t14}
              i18n={errorTextI18n}
              color={Color.textRed1}
              style={styles.error}>
              {errorText}
            </Text>
          </Animated.View>
        )}
        {!error && hint && (
          <>
            <Spacer height={8} />
            <Text variant={TextVariant.t14} i18n={hint} style={styles.error} />
          </>
        )}
        {Boolean(infoBlock) && (
          <Button
            size={ButtonSize.small}
            style={styles.infoButton}
            onPress={() => {
              showModal('info', {
                title: getText(infoBlock!.title),
                description: infoBlock!.description
                  ? getText(infoBlock!.description)
                  : '',
              });
            }}>
            <Text color={Color.textGreen1} variant={TextVariant.t11}>
              {infoBlock!.label}
            </Text>
          </Button>
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
  disabled: {
    opacity: 0.5,
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
    alignItems: 'flex-start',
  },
  inputRolling: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: Color.textBase1,
    fontSize: 16,
    textAlignVertical: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRollingContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 28,
  },
  error: {
    marginLeft: 4,
  },
  sub: {
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: 14,
  },
  leadingSub: {
    justifyContent: 'center',
    alignSelf: 'center',
    marginRight: 14,
  },
  placeholder: {
    position: 'absolute',
    height: 28,
    top: 18,
  },
  infoButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
});
