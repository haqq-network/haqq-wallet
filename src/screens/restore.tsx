import React, { useCallback, useMemo, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { useWallets } from '../contexts/wallets';
import { useApp } from '../contexts/app';
import { utils } from 'ethers';

type RestoreScreenProp = CompositeScreenProps<any, any>;

export const RestoreScreen = ({ navigation }: RestoreScreenProp) => {
  const [password, setPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const wallet = useWallets();
  const app = useApp();

  const checked = useMemo(
    () => password.length && utils.isValidMnemonic(mnemonic),
    [password, mnemonic],
  );

  const onDone = useCallback(async () => {
    await app.setPin(password);
    await app.createUser();
    await wallet.addWalletFromMnemonic(mnemonic);

    navigation.replace('home');
  }, [wallet, password, mnemonic]);

  return (
    <View style={page.container}>
      <View style={{ flex: 1 }} />
      <Text>Restore Screen</Text>
      <TextInput
        style={page.input}
        placeholder={'Mnemonic'}
        onChangeText={setMnemonic}
        multiline
      />
      <TextInput
        style={page.input}
        placeholder={'Password'}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button disabled={!checked} title="Done" onPress={onDone} />
      <View style={{ flex: 1 }} />
    </View>
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
