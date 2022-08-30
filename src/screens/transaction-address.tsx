import {KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import React, {useCallback, useMemo, useState} from 'react';
import {utils} from 'ethers';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, ButtonVariant, Input} from '../components/ui';
import {Container} from '../components/container';
import {Spacer} from '../components/spacer';

type TransactionAddressScreenProp = CompositeScreenProps<any, any>;

export const TransactionAddressScreen = ({
  route,
  navigation,
}: TransactionAddressScreenProp) => {
  const [to, setTo] = useState('');

  const checked = useMemo(() => utils.isAddress(to.trim()), [to]);

  const onDone = useCallback(async () => {
    navigation.navigate('transactionSum', {
      from: route.params.from,
      to: to.trim(),
    });
  }, [navigation, route.params.from, to]);

  return (
    <Container>
      <Input
        label="Send to"
        style={page.input}
        placeholder="Enter Address or contact name"
        onChangeText={setTo}
        value={to}
      />
      <Spacer />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{height: 70}}>
        <Button
          disabled={!checked}
          variant={ButtonVariant.contained}
          title="Continue"
          onPress={onDone}
        />
      </KeyboardAvoidingView>
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
  input: {},
});
