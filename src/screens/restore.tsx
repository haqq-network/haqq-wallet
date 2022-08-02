import React, {useMemo, useState} from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {validateMnemonic} from '../bip39';

type RestoreScreenProp = CompositeScreenProps<any, any>;

export const RestoreScreen = ({navigation}: RestoreScreenProp) => {
  const [password, setPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  const checked = useMemo(
    () => password.length && validateMnemonic(mnemonic),
    [password, mnemonic],
  );

  return (
    <View style={page.container}>
      <View style={{flex: 1}} />
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
      <Button
        disabled={!checked}
        title="Done"
        onPress={() => navigation.navigate('home')}
      />
      <View style={{flex: 1}} />
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
