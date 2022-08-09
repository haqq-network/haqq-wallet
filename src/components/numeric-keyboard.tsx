import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type NumericKeyboardProps = {
  onPress: (value: number) => void;
};

export const NumericKeyboard = ({onPress}: NumericKeyboardProps) => {
  return (
    <View style={page.container}>
      <RoundButton value={1} onPress={onPress} />
      <RoundButton value={2} onPress={onPress} />
      <RoundButton value={3} onPress={onPress} />
      <RoundButton value={4} onPress={onPress} />
      <RoundButton value={5} onPress={onPress} />
      <RoundButton value={6} onPress={onPress} />
      <RoundButton value={7} onPress={onPress} />
      <RoundButton value={8} onPress={onPress} />
      <RoundButton value={9} onPress={onPress} />
      <View style={page.spacer} />
      <RoundButton value={0} onPress={onPress} />
      <RoundButton value={-1} onPress={onPress} />
    </View>
  );
};

const RoundButton = ({
  onPress,
  value,
}: {
  onPress: (value: number) => void;
  value: number;
}) => {
  return (
    <TouchableOpacity
      style={page.button}
      onPress={() => {
        onPress(value);
      }}>
      <Text style={page.roundButton}>{value}</Text>
    </TouchableOpacity>
  );
};
const windowWidth = Dimensions.get('window').width;
const page = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
    gap: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    padding: 10,
    borderColor: '#000000',
    borderWidth: 1,
    marginTop: 20,
    marginBottom: 20,
    width: windowWidth / 4,
    height: windowWidth / 4,
    borderRadius: windowWidth / 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButton: {},
  spacer: {
    width: windowWidth / 4,
    height: windowWidth / 4,
  },
});
