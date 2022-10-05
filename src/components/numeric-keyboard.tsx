import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, IconButton, Paragraph} from './ui';

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
      <IconButton style={page.button} onPress={() => onPress(1)}>
        <Paragraph clean style={page.buttonText}>
          1
        </Paragraph>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(2)}>
        <Paragraph clean style={page.buttonText}>
          2
        </Paragraph>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(3)}>
        <Paragraph clean style={page.buttonText}>
          3
        </Paragraph>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(4)}>
        <Paragraph clean style={page.buttonText}>
          4
        </Paragraph>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(5)}>
        <Paragraph clean style={page.buttonText}>
          5
        </Paragraph>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(6)}>
        <Paragraph clean style={page.buttonText}>
          6
        </Paragraph>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(7)}>
        <Paragraph clean style={page.buttonText}>
          7
        </Paragraph>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(8)}>
        <Paragraph clean style={page.buttonText}>
          8
        </Paragraph>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(9)}>
        <Paragraph clean style={page.buttonText}>
          9
        </Paragraph>
      </IconButton>
      <View style={page.button}>{additionButton}</View>
      <IconButton style={page.button} onPress={() => onPress(0)}>
        <Paragraph clean style={page.buttonText}>
          0
        </Paragraph>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(-1)}>
        <Icon name={'clear'} />
      </IconButton>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    marginHorizontal: 12,
    marginVertical: 2,
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 36,
    lineHeight: 43,
    letterSpacing: 0.38,
  },
});
