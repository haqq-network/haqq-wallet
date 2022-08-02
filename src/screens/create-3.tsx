import React, {useEffect, useMemo, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';

type Create3ScreenProp = CompositeScreenProps<any, any>;

export const Create3Screen = ({navigation, route}: Create3ScreenProp) => {
  const words = route.params.words as string[];
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean>(false);
  const buttons = useMemo(() => {
    return words
      .map(value => ({value, sort: Math.random()}))
      .sort((a, b) => a.sort - b.sort)
      .map(({value}, key) => ({
        value,
        key,
      }));
  }, [words]);

  useEffect(() => {
    setChecked(
      selected.length === words.length &&
        selected.join(' ') === words.join(' '),
    );
  }, [words, selected]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Create 3 Screen</Text>
      <Text>{selected.join(' ')}</Text>
      <View style={page.buttons}>
        {buttons.map(val => (
          <Button
            disabled={selected.includes(val.value)}
            title={val.value}
            key={val.key}
            onPress={() => {
              setSelected(sel => sel.concat(val.value));
            }}
          />
        ))}
      </View>
      <Button disabled={!checked} title="Done" onPress={() => {}} />
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
