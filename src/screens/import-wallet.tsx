import React, {useCallback, useMemo, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, StyleSheet, TextInput} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {isHexString} from '../utils';
import {Container, Paragraph} from '../components/ui';
import {BG_9} from '../variables';

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
      <Paragraph clean>Import Wallet Screen</Paragraph>
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
    borderColor: BG_9,
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 20,
  },
});
