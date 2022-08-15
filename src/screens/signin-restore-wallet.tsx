import React, {useCallback, useMemo, useState} from 'react';
import {KeyboardAvoidingView, StyleSheet, TextInput} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {utils} from 'ethers';
import {useWallets} from '../contexts/wallets';
import {Container} from '../components/container';
import {Button, ButtonVariant, Title} from '../components/ui';

type SignInRestoreScreenProp = CompositeScreenProps<any, any>;

export const SignInRestoreScreen = ({navigation}: SignInRestoreScreenProp) => {
  const [mnemonic, setMnemonic] = useState('');
  const wallet = useWallets();

  const checked = useMemo(() => utils.isValidMnemonic(mnemonic), [mnemonic]);

  const onDone = useCallback(async () => {
    await wallet.addWalletFromMnemonic(mnemonic);

    navigation.replace('signin-finish');
  }, [wallet, mnemonic, navigation]);

  return (
    <Container style={{justifyContent: 'center'}}>
      <KeyboardAvoidingView behavior="height">
        <Title>Restore Screen</Title>
        <TextInput
          style={page.input}
          placeholder={'Mnemonic'}
          onChangeText={setMnemonic}
          multiline
        />
        <Button
          disabled={!checked}
          title="Done"
          onPress={onDone}
          variant={ButtonVariant.contained}
        />
      </KeyboardAvoidingView>
    </Container>
  );
};

const page = StyleSheet.create({
  input: {
    padding: 10,
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 20,
  },
});
