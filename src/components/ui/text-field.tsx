import React, {memo, useEffect, useRef, useState} from 'react';

import {
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputContentSizeChangeEventData,
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
import {createTheme} from '@app/helpers';
import {IS_IOS} from '@app/variables';

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
            selectionColor={getColor(Color.textGreen1)}
            allowFontScaling={false}
            style={[
              styles.input,
              {
                borderColor: color,
                width: width - (twoIcons ? 100 + 45 : 100),
              },
            ]}
            ref={inputRef}
            placeholderTextColor={Color.textBase2}
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
          <Animated.View
            style={[styles.labelContainer, labelAnimStyle]}
            pointerEvents="none">
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
          {rightAction && <View style={styles.sub}>{rightAction}</View>}
        </Animated.View>
        {!!error && <Text style={styles.error}>{errorText}</Text>}
      </>
    );
  },
);

const styles = createTheme({
  container: {
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Color.bg8,
  },
  containerError: {
    backgroundColor: Color.bg7,
  },
  input: {
    alignSelf: 'flex-start',
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: Color.textBase1,
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
    color: Color.bg5,
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
    color: Color.textBase2,
    top: IS_IOS ? 28 : 26,
    left: 18,
  },
});
