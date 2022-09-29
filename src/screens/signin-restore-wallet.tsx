import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';

import {utils} from 'ethers';
import {useWallets} from '../contexts/wallets';
import {
  Button,
  ButtonVariant,
  IconButton,
  KeyboardSafeArea,
  Paragraph,
  ParagraphSize,
  Spacer,
  Textarea,
} from '../components/ui';
import {MAIN_ACCOUNT_NAME, TEXT_GREEN_1} from '../variables';

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
  }, [wallets, seed, navigation, route.params.nextScreen]);

  const onPressPaste = useCallback(async () => {
    const text = await Clipboard.getString();
    setSeed(text);
  }, []);

  return (
    <KeyboardSafeArea style={{paddingHorizontal: 20}}>
      <Paragraph style={page.intro}>Recovery phrase or Private key</Paragraph>
      <Textarea
        style={page.input}
        value={seed}
        placeholder="Backup phrase"
        onChangeText={setSeed}
      />
      <IconButton onPress={onPressPaste} style={{alignSelf: 'flex-start'}}>
        <Paragraph
          size={ParagraphSize.s}
          style={{color: TEXT_GREEN_1, fontWeight: '600', textAlign: 'left'}}>
          Paste from Clipboard
        </Paragraph>
      </IconButton>
      <Spacer />
      <Button
        disabled={!checked}
        title="Recovery"
        onPress={onDone}
        variant={ButtonVariant.contained}
      />
    </KeyboardSafeArea>
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
