import React, {memo, useCallback, useEffect, useRef, useState} from 'react';

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

import {
  IS_IOS,
  LIGHT_BG_5,
  LIGHT_BG_7,
  LIGHT_BG_8,
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
  LIGHT_TEXT_GREEN_1,
  LIGHT_TEXT_RED_1,
} from '../../variables';

type Props = React.ComponentProps<typeof TextInput> & {
  label: string;
  error?: boolean;
  errorText?: string | null;
  placeholder?: string;
  rightAction?: React.ReactNode;
  multiline?: boolean;
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

    const contentSizeChangeEvent = useEvent((event: nativeEventType) => {
      'worklet';
      onChangeContentSize(event.contentSize.height);
    });

    const contentSizeChangeEventIOS = (event: sizeChangeEventType) => {
      'worklet';
      onChangeContentSize(event.nativeEvent.contentSize.height);
    };

    const onInputEvent = useCallback(() => {
      focusAnim.value = withTiming(isFocused || !!value ? 1 : 0, {
        duration: 150,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }, [value, focusAnim, isFocused]);

    useEffect(() => {
      onInputEvent();
    }, [onInputEvent]);

    let color = LIGHT_TEXT_BASE_2;
    if (error) {
      color = LIGHT_TEXT_RED_1;
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

    return (
      <>
        <Animated.View
          style={[
            page.container,
            style,
            error && page.containerError,
            inputAnimStyle,
          ]}>
          <AnimatedTextInput
            selectionColor={LIGHT_TEXT_GREEN_1}
            allowFontScaling={false}
            style={[
              page.input,
              {
                borderColor: color,
                width: width - 100,
              },
            ]}
            ref={inputRef}
            placeholder={isFocused ? placeholder : ''}
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
          <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
            <Animated.View style={[page.labelContainer, labelAnimStyle]}>
              <Text
                allowFontScaling={false}
                style={[
                  page.label,
                  isLarge && page.labelMultiline,
                  {
                    color,
                  },
                ]}>
                {label}
              </Text>
            </Animated.View>
          </TouchableWithoutFeedback>

          {rightAction && <View style={page.sub}>{rightAction}</View>}
        </Animated.View>
        {!!error && <Text style={page.error}>{errorText}</Text>}
      </>
    );
  },
);

const page = StyleSheet.create({
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
    right: 0,
    width: 50,
  },
});
