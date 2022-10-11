import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  View,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  BG_5,
  BG_7,
  BG_8,
  TEXT_BASE_1,
  TEXT_BASE_2,
  TEXT_RED_1,
} from '../../variables';

type Props = React.ComponentProps<typeof TextInput> & {
  label: string;
  error?: boolean;
  errorText?: string | null;
  placeholder?: string;
  rightAction?: React.ReactNode;
  multiline?: boolean;
};

export const TextField: React.FC<Props> = ({
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
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused || !!value ? 1 : 0,
      duration: 150,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [focusAnim, isFocused, value]);

  let color = TEXT_BASE_2;
  if (error) {
    color = TEXT_RED_1;
  }

  const top = isFocused ? 0 : -5;
  const containerStyle = isFocused ? page.placeholderStyle : page.input;
  return (
    <>
      <View
        style={[
          page.container,
          style,
          error && page.containerError,
          multiline && page.containerMultiline,
        ]}>
        <TextInput
          style={[
            containerStyle,
            {
              borderColor: color,
            },
          ]}
          ref={inputRef}
          placeholder={isFocused ? placeholder : ''}
          {...restOfProps}
          value={value}
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
          <Animated.View
            style={[
              page.labelContainer,
              {
                transform: [
                  {
                    scale: focusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.75],
                    }),
                  },
                  {
                    translateY: focusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, -1],
                    }),
                  },
                  {
                    translateX: focusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [multiline ? 6 : 0, multiline ? -12 : -8],
                    }),
                  },
                ],
              },
            ]}>
            <Text
              style={[
                page.label,
                multiline && page.labelMultiline,
                {
                  color,
                  top,
                },
              ]}>
              {label}
            </Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        {rightAction && <View style={page.sub}>{rightAction}</View>}
      </View>
      {!!error && <Text style={page.error}>{errorText}</Text>}
    </>
  );
};

const page = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: BG_8,
    height: 58,
  },
  containerMultiline: {
    height: 170,
  },
  containerError: {
    backgroundColor: BG_7,
  },

  input: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    fontSize: 16,
    color: TEXT_BASE_1,
  },
  placeholderStyle: {
    alignSelf: 'flex-start',
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    fontSize: 17.5,
    color: TEXT_BASE_1,
    top: 24,
  },
  labelContainer: {
    position: 'absolute',
    paddingHorizontal: 14,
    paddingTop: 5,
  },
  label: {
    fontFamily: 'SF Pro Display',
    fontSize: 19,
    left: 0,
  },
  labelMultiline: {
    left: -4.5,
  },
  error: {
    marginLeft: 35,
    bottom: 8,
    fontSize: 12,
    color: BG_5,
    fontFamily: 'SF Pro Display',
  },
  sub: {
    justifyContent: 'center',
  },
});
