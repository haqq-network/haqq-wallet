import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  IconButton,
  LabeledBlock,
  Paragraph,
  Swap,
} from '../components/ui';
import {BG_2, GRAPHIC_GREEN_1, TEXT_BASE_1, TEXT_BASE_2} from '../variables';
import {Spacer} from '../components/spacer';
import {useWallets} from '../contexts/wallets';
import {Container} from '../components/container';

type TransactionSumScreenProp = CompositeScreenProps<any, any>;

export const TransactionSumScreen = ({
  route,
  navigation,
}: TransactionSumScreenProp) => {
  const wallets = useWallets();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    wallets.getBalance(route.params.from).then(result => {
      setBalance(result);
    });
  }, [route.params.from, wallets]);

  const checked = useMemo(() => parseFloat(amount) > 0, [amount]);

  const onDone = useCallback(async () => {
    navigation.navigate('transactionConfirmation', {
      from: route.params.from,
      to: route.params.to,
      amount: parseFloat(amount),
    });
  }, [amount, navigation, route.params.from, route.params.to]);

  const onPressMax = useCallback(() => {
    setAmount(balance.toFixed(2));
  }, [balance]);

  const onPressSwap = () => {};

  return (
    <Container>
      <KeyboardAvoidingView style={{flex: 1, justifyContent: 'space-between'}}>
        <LabeledBlock label="Send to" style={{marginBottom: 50}}>
          <Paragraph style={{color: TEXT_BASE_1}}>{route.params.to}</Paragraph>
        </LabeledBlock>
        <Text style={page.subtitle}>ISLM</Text>
        <View style={page.sum}>
          <IconButton onPress={onPressSwap} style={page.swapButton}>
            <Swap color={GRAPHIC_GREEN_1} />
          </IconButton>
          <TextInput
            style={page.input}
            value={amount}
            placeholder="0"
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor={TEXT_BASE_2}
          />
          <Button
            title="Max"
            onPress={onPressMax}
            variant={ButtonVariant.second}
            size={ButtonSize.small}
          />
        </View>
        <Text style={page.available}>
          Available: ${balance.toFixed(8)} ISLM
        </Text>
        <Spacer />
        <Button
          disabled={!checked}
          variant={ButtonVariant.contained}
          title="Preview"
          onPress={onDone}
        />
      </KeyboardAvoidingView>
    </Container>
  );
};

const page = StyleSheet.create({
  input: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 46,
    color: TEXT_BASE_1,
  },
  swapButton: {
    backgroundColor: BG_2,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  subtitle: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: TEXT_BASE_2,
    marginBottom: 4,
  },
  sum: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  available: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    color: TEXT_BASE_2,
  },
});
