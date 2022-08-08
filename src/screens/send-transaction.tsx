import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import React, {useCallback, useMemo, useState} from 'react';
import {utils} from 'ethers';
import {useWallets} from '../contexts/wallets';
import {CompositeScreenProps} from '@react-navigation/native';

type SendTransactionScreenProp = CompositeScreenProps<any, any>;

export const SendTransactionScreen = ({
  route,
  navigation,
}: SendTransactionScreenProp) => {
  const wallets = useWallets();
  const [from, setFrom] = useState(route.params.from ?? '');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  const checked = useMemo(
    () =>
      utils.isAddress(from) && utils.isAddress(to) && parseFloat(amount) > 0,
    [from, to, amount],
  );

  const onDone = useCallback(() => {
    wallets.sendTransaction(from, to, parseFloat(amount)).then(result => {
      console.log(result);
      navigation.goBack();
    });
  }, [amount, from, to, wallets]);

  return (
    <View style={page.container}>
      <Text>Send transaction Screen</Text>
      <TextInput
        value={from}
        style={page.input}
        placeholder={'From'}
        onChangeText={setFrom}
      />
      <TextInput
        style={page.input}
        placeholder={'To'}
        onChangeText={setTo}
        value={to}
      />
      <TextInput
        style={page.input}
        value={amount}
        placeholder={'Amount'}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button disabled={!checked} title="Send" onPress={onDone} />
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
