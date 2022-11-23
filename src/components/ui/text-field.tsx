import React, {memo, useEffect, useRef, useState} from 'react';

import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputContentSizeChangeEventData,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useEvent,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color, getColor} from '@app/colors';

import {
  IS_IOS,
  LIGHT_BG_5,
  LIGHT_BG_7,
  LIGHT_BG_8,
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_GREEN_1,
  PLACEHOLDER_GRAY,
} from '../../variables';

type Props = React.ComponentProps<typeof TextInput> & {
  label: string;
  error?: boolean;
  errorText?: string | null;
  placeholder?: string;
  rightAction?: React.ReactNode;
  multiline?: boolean;
  twoIcons?: boolean;
  size?: 'small' | 'large';
};

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
type sizeChangeEventType =
  NativeSyntheticEvent<TextInputContentSizeChangeEventData>;
type nativeEventType = sizeChangeEventType['nativeEvent'];

export const TextField: React.FC<Props> = memo(
  ({
    size = 'small',
    label,
    error,
    errorText,
    value,
    style,
    onBlur,
    onFocus,
    placeholder,
    rightAction,
    multiline,
    twoIcons,
    ...restOfProps
  }) => {
    const isLarge = size === 'large';
    const {width} = useWindowDimensions();
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef<TextInput>(null);
    const height = useSharedValue(30);
    const focusAnim = useSharedValue(0);

    const onChangeContentSize = (newHeight: number) => {
      'worklet';
      const inputH = Math.max(newHeight, 28);
      height.value = inputH + 30;
    };

    const contentSizeChangeEvent = useEvent(
      ({contentSize}: nativeEventType) => {
        'worklet';
        onChangeContentSize(contentSize.height);
      },
    );

    const contentSizeChangeEventIOS = ({
      nativeEvent: {contentSize},
    }: sizeChangeEventType) => {
      'worklet';
      onChangeContentSize(contentSize.height);
    };

    useEffect(() => {
      focusAnim.value = withTiming(isFocused || !!value ? 1 : 0, {
        duration: 150,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }, [value, focusAnim, isFocused]);

    let color = getColor(Color.textBase2);
    if (error) {
      color = getColor(Color.textRed1);
    }

    const labelAnimStyle = useAnimatedStyle(
      () => ({
        transform: [
          {
            scale: interpolate(focusAnim.value, [0, 1], [1, 0.75]),
          },
          {
            translateY: interpolate(focusAnim.value, [0, 1], [24, 9]),
          },
          {
            translateX: interpolate(
              focusAnim.value,
              [0, 1],
              [isLarge ? 5 : 0, isLarge ? -12 : -8],
            ),
          },
        ],
      }),
      [isLarge],
    );

    const inputAnimStyle = useAnimatedStyle(() => ({
      height: height.value,
    }));

    const onPressLabel = () => {
      inputRef.current?.focus();
    };

    return (
      <>
        <Animated.View
          style={[
            styles.container,
            style,
            error && styles.containerError,
            inputAnimStyle,
          ]}>
          {!value && isFocused && (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
          <AnimatedTextInput
            selectionColor={LIGHT_TEXT_GREEN_1}
            allowFontScaling={false}
            style={[
              styles.input,
              {
                borderColor: color,
                width: width - (twoIcons ? 100 + 45 : 100),
              },
            ]}
            ref={inputRef}
            placeholderTextColor={PLACEHOLDER_GRAY}
            {...restOfProps}
            value={value}
            multiline={multiline}
            onContentSizeChange={
              IS_IOS ? contentSizeChangeEventIOS : contentSizeChangeEvent
            }
            onBlur={event => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            onFocus={event => {
              setIsFocused(true);
              onFocus?.(event);
            }}
          />
          <TouchableWithoutFeedback onPress={onPressLabel}>
            <Animated.View style={[styles.labelContainer, labelAnimStyle]}>
              <Text
                allowFontScaling={false}
                style={[
                  styles.label,
                  isLarge && styles.labelMultiline,
                  {
                    color,
                  },
                ]}>
                {label}
              </Text>
            </Animated.View>
          </TouchableWithoutFeedback>
          {rightAction && <View style={styles.sub}>{rightAction}</View>}
        </Animated.View>
        {!!error && <Text style={styles.error}>{errorText}</Text>}
      </>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: LIGHT_BG_8,
  },
  containerError: {
    backgroundColor: LIGHT_BG_7,
  },
  input: {
    alignSelf: 'flex-start',
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: LIGHT_TEXT_BASE_1,
    top: IS_IOS ? 26 : 24,
    fontSize: 16,
    minHeight: 28,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
    right: IS_IOS ? 0 : 4.5,
  },
  labelContainer: {
    position: 'absolute',
    paddingHorizontal: 14,
  },
  label: {
    fontFamily: 'SF Pro Display',
    fontSize: 18,
    top: -4,
    left: 0,
  },
  labelMultiline: {
    left: -4.5,
  },
  error: {
    marginLeft: 35,
    bottom: 8,
    fontSize: 12,
    color: LIGHT_BG_5,
    fontFamily: 'SF Pro Display',
  },
  sub: {
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    right: 16,
  },
  placeholder: {
    position: 'absolute',
    color: PLACEHOLDER_GRAY,
    top: IS_IOS ? 28 : 26,
    left: 18,
  },
});
