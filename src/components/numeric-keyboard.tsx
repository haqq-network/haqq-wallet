import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {Icon, IconButton} from './ui';

export type NumericKeyboardProps = {
  onPress: (value: number) => void;
};

export const NumericKeyboard = ({onPress}: NumericKeyboardProps) => {
  return (
    <View style={page.container}>
      <IconButton style={page.button} onPress={() => onPress(1)}>
        <Text style={page.buttonText}>1</Text>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(2)}>
        <Text style={page.buttonText}>2</Text>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(3)}>
        <Text style={page.buttonText}>3</Text>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(4)}>
        <Text style={page.buttonText}>4</Text>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(5)}>
        <Text style={page.buttonText}>5</Text>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(6)}>
        <Text style={page.buttonText}>6</Text>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(7)}>
        <Text style={page.buttonText}>7</Text>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(8)}>
        <Text style={page.buttonText}>8</Text>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(9)}>
        <Text style={page.buttonText}>9</Text>
      </IconButton>
      <View style={page.spacer} />
      <IconButton style={page.button} onPress={() => onPress(0)}>
        <Text style={page.buttonText}>0</Text>
      </IconButton>
      <IconButton style={page.button} onPress={() => onPress(-1)}>
        <Icon name={'clear'} />
      </IconButton>
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;
const page = StyleSheet.create({
  container: {
    width: 264,
    justifyContent: 'space-between',
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
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
  spacer: {
    width: windowWidth / 4,
    height: windowWidth / 4,
  },
});
