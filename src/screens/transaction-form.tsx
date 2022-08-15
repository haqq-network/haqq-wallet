import {StyleSheet, Text, TextInput, View} from 'react-native';
import React, {useCallback, useMemo, useState} from 'react';
import {utils} from 'ethers';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, ButtonVariant} from '../components/ui';

type SendTransactionScreenProp = CompositeScreenProps<any, any>;

export const TransactionFormScreen = ({
  route,
  navigation,
}: SendTransactionScreenProp) => {
  const [from, setFrom] = useState(route.params.from ?? '');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  const checked = useMemo(
    () =>
      utils.isAddress(from.trim()) &&
      utils.isAddress(to.trim()) &&
      parseFloat(amount) > 0,
    [from, to, amount],
  );

  const onDone = useCallback(async () => {
    navigation.navigate('transaction-confirmation', {
      from: from.trim(),
      to: to.trim(),
      amount: parseFloat(amount),
    });
  }, [amount, from, navigation, to]);

  console.log(checked);

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
      <Button
        disabled={!checked}
        variant={ButtonVariant.contained}
        title="Send"
        onPress={onDone}
      />
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
