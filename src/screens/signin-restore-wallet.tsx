import React, {useCallback, useMemo, useState} from 'react';
import {KeyboardAvoidingView, StyleSheet} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {utils} from 'ethers';
import {useWallets} from '../contexts/wallets';
import {Container} from '../components/container';
import {Button, ButtonVariant, Paragraph, Textarea} from '../components/ui';
import {MAIN_ACCOUNT_NAME} from '../variables';

type SignInRestoreScreenProp = CompositeScreenProps<any, any>;

export const SignInRestoreScreen = ({
  navigation,
  route,
}: SignInRestoreScreenProp) => {
  const [seed, setSeed] = useState('');
  const wallets = useWallets();

  const checked = useMemo(
    () => utils.isValidMnemonic(seed.trim()) || utils.isHexString(seed.trim()),
    [seed],
  );

  const onDone = useCallback(async () => {
    let name =
      wallets.getSize() === 0
        ? MAIN_ACCOUNT_NAME
        : `Account #${wallets.getSize() + 1}`;
    const wallet = utils.isValidMnemonic(seed.trim())
      ? await wallets.addWalletFromMnemonic(seed.trim(), name, false)
      : await wallets.addWalletFromPrivateKey(seed.trim(), name, false);
    wallet.mnemonic_saved = true;
    navigation.replace(route.params.nextScreen ?? 'onboarding-setup-pin');
  }, [seed, wallets, navigation]);

  return (
    <Container>
      <Paragraph style={page.intro}>Recovery phrase or Private key</Paragraph>
      <KeyboardAvoidingView behavior="height">
        <Textarea
          style={page.input}
          placeholder="Backup phrase"
          onChangeText={setSeed}
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
  intro: {
    marginBottom: 32,
  },
  input: {
    marginBottom: 8,
  },
});
