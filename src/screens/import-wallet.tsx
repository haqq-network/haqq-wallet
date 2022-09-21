import React, {useCallback, useMemo, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, StyleSheet, Text, TextInput} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {isHexString} from '../utils';
import {Container} from '../components/ui';

type HomeScreenProp = CompositeScreenProps<any, any>;

export const ImportWalletScreen = ({navigation}: HomeScreenProp) => {
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
      <Text>Import Wallet Screen</Text>
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
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 10,
    gap: 10,
  },
  input: {
    padding: 10,
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 20,
  },
});
