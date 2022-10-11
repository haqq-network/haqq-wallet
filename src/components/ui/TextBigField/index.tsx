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
} from '../../../variables';

type Props = React.ComponentProps<typeof TextInput> & {
  label: string;
  error?: boolean;
  errorText?: string | null;
  placeholder?: string;
  rightAction?: React.ReactNode;
};

const TextBigField: React.FC<Props> = props => {
  const {
    label,
    error,
    errorText,
    value,
    style,
    onBlur,
    onFocus,
    placeholder,
    rightAction,
    ...restOfProps
  } = props;
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

  let color = isFocused ? TEXT_BASE_2 : TEXT_BASE_2;
  if (error) {
    color = TEXT_RED_1;
  }

  const top = isFocused ? 0 : -5;
  const containerStyle = isFocused ? page.placeholderStyle : page.input;
  return (
    <>
      <View
        style={[page.container, style, {backgroundColor: error ? BG_7 : BG_8}]}>
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
                      outputRange: [6, -10],
                    }),
                  },
                ],
              },
            ]}>
            <Text
              style={[
                page.label,
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
    height: 170,
    justifyContent: 'space-between',
  },
  input: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    fontSize: 16,
    color: TEXT_BASE_1,
    top: 8,
  },
  placeholderStyle: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    fontSize: 17.5,
    color: TEXT_BASE_1,
    top: 14,
  },
  labelContainer: {
    position: 'absolute',
    paddingHorizontal: 14,
    paddingTop: 5,
  },
  label: {
    fontFamily: 'SF Pro Display',
    fontSize: 19,
    right: 6,
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

export default TextBigField;
