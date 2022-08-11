import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {Container} from '../components/container';
import {Title} from '../components/ui';

type SignInCreateWalletVerifyScreenProp = CompositeScreenProps<any, any>;

export const SignInCreateWalletVerifyScreen = ({
  navigation,
  route,
}: SignInCreateWalletVerifyScreenProp) => {
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
      navigation.navigate('signin-finish');
    });
  }, [mnemonic, navigation, wallet]);

  useEffect(() => {
    setChecked(
      selected.length === words.length &&
        selected.join(' ') === words.join(' '),
    );
  }, [words, selected]);

  return (
    <Container>
      <Title>Create 3 Screen</Title>
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
    </Container>
  );
};

const page = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
