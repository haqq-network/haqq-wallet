import React from 'react';

import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Icon, IconButton, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {moderateScale} from '@app/helpers/scaling-utils';

export type NumericKeyboardProps = {
  onPress: (value: number) => void;
  additionButton?: React.ReactNode;
};

export const NumericKeyboard = ({
  onPress,
  additionButton,
}: NumericKeyboardProps) => {
  return (
    <View style={page.container}>
      <IconButton
        style={page.button}
        onPress={() => onPress(1)}
        testID="numeric_keyboard_1">
        <Text clean style={page.buttonText}>
          1
        </Text>
      </IconButton>
      <IconButton
        style={page.button}
        onPress={() => onPress(2)}
        testID="numeric_keyboard_2">
        <Text clean style={page.buttonText}>
          2
        </Text>
      </IconButton>
      <IconButton
        style={page.button}
        onPress={() => onPress(3)}
        testID="numeric_keyboard_3">
        <Text clean style={page.buttonText}>
          3
        </Text>
      </IconButton>
      <IconButton
        style={page.button}
        onPress={() => onPress(4)}
        testID="numeric_keyboard_4">
        <Text clean style={page.buttonText}>
          4
        </Text>
      </IconButton>
      <IconButton
        style={page.button}
        onPress={() => onPress(5)}
        testID="numeric_keyboard_5">
        <Text clean style={page.buttonText}>
          5
        </Text>
      </IconButton>
      <IconButton
        style={page.button}
        onPress={() => onPress(6)}
        testID="numeric_keyboard_6">
        <Text clean style={page.buttonText}>
          6
        </Text>
      </IconButton>
      <IconButton
        style={page.button}
        onPress={() => onPress(7)}
        testID="numeric_keyboard_7">
        <Text clean style={page.buttonText}>
          7
        </Text>
      </IconButton>
      <IconButton
        style={page.button}
        onPress={() => onPress(8)}
        testID="numeric_keyboard_8">
        <Text clean style={page.buttonText}>
          8
        </Text>
      </IconButton>
      <IconButton
        style={page.button}
        onPress={() => onPress(9)}
        testID="numeric_keyboard_9">
        <Text clean style={page.buttonText}>
          9
        </Text>
      </IconButton>
      <View style={page.button}>{additionButton}</View>
      <IconButton
        style={page.button}
        onPress={() => onPress(0)}
        testID="numeric_keyboard_0">
        <Text clean style={page.buttonText}>
          0
        </Text>
      </IconButton>
      <IconButton
        style={page.button}
        onPress={() => onPress(-1)}
        testID="numeric_keyboard_rem">
        <Icon m name="clear" color={getColor(Color.textBase1)} />
      </IconButton>
    </View>
  );
};

const page = createTheme({
  container: {
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    marginHorizontal: 12,
    marginVertical: 2,
    width: moderateScale(72, 0.6),
    height: moderateScale(72, 0.6),
    maxHeight: moderateScale(72, 1.2),
    maxWidth: moderateScale(72, 1.2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 36,
    lineHeight: 43,
    letterSpacing: 0.38,
    color: Color.textBase1,
  },
});
