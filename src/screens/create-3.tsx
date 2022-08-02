import React, {useEffect, useMemo, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallet} from '../contexts/wallet';

type Create3ScreenProp = CompositeScreenProps<any, any>;

export const Create3Screen = ({navigation}: Create3ScreenProp) => {
  const wallet = useWallet();

  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean>(false);

  const words = useMemo(() => wallet.getMnemonicWords(), [wallet]);
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
      <Button
        disabled={!checked}
        title="Done"
        onPress={() => navigation.navigate('home')}
      />
    </View>
  );
};

const page = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
