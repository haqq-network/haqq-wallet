import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';

type Create3ScreenProp = CompositeScreenProps<any, any>;

export const CreateWalletVerifyScreen = ({
  navigation,
  route,
}: Create3ScreenProp) => {
  const {mnemonic} = route.params;
  const wallet = useWallets();

  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean>(false);

  const words = useMemo<string[]>(() => mnemonic.split(' '), [mnemonic]);
  const buttons = useMemo(() => {
    return words
      .map(value => ({value, sort: Math.random()}))
      .sort((a, b) => a.sort - b.sort)
      .map(({value}, key) => ({
        value,
        key,
      }));
  }, [words]);

  const onDone = useCallback(() => {
    wallet.addWalletFromMnemonic(mnemonic).then(() => {
      navigation.navigate('home');
    });
  }, [mnemonic, navigation, wallet]);

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
      <Button disabled={!checked} title="Done" onPress={onDone} />
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
