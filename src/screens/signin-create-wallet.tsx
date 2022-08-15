import React, {useMemo} from 'react';
import {Button, Text} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {Container} from '../components/container';
import {Title} from '../components/ui';

type SignInCreateWalletScreenProp = CompositeScreenProps<any, any>;

export const SignInCreateWalletScreen = ({
  navigation,
}: SignInCreateWalletScreenProp) => {
  const wallet = useWallets();

  const mnemonic = useMemo(() => wallet.generateMnemonic(), [wallet]);

  return (
    <Container>
      <Title>Create 2 Screen</Title>
      <Text>{mnemonic}</Text>
      <Button
        title="Go next"
        onPress={() =>
          navigation.navigate('signin-create-wallet-verify', {mnemonic})
        }
      />
    </Container>
  );
};
