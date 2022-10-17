import React, {useCallback, useMemo, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {Button, StyleSheet, TextInput} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {isHexString} from '../utils';
import {Container, Text} from '../components/ui';
import {GRAPHIC_SECOND_5} from '../variables';

export const ImportWalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [privateKey, setPrivateKey] = useState('');
  const [name, setName] = useState('');
  const wallet = useWallets();

  const checked = useMemo(() => isHexString(privateKey, 32), [privateKey]);

  const onDone = useCallback(() => {
    wallet.addWalletFromPrivateKey(privateKey, name).then(() => {
      navigation.navigate('home');
    });
  }, [wallet, privateKey, name, navigation]);

  return (
    <Container>
      <Text clean>Import Wallet Screen</Text>
      <TextInput
        style={page.input}
        placeholder={'Name'}
        onChangeText={setName}
      />

      <TextInput
        style={page.input}
        placeholder={'Private key'}
        onChangeText={setPrivateKey}
        multiline
      />
      <Button disabled={!checked} title="Done" onPress={onDone} />
    </Container>
  );
};

const page = StyleSheet.create({
  input: {
    padding: 10,
    borderColor: GRAPHIC_SECOND_5,
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 20,
  },
});
