import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import * as Sentry from '@sentry/react-native';

import {utils} from 'ethers';
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
import {TEXT_GREEN_1} from '../variables';
import {useApp} from '../contexts/app';

type SignInRestoreScreenProp = CompositeScreenProps<any, any>;

export const SignInRestoreScreen = ({
  navigation,
  route,
}: SignInRestoreScreenProp) => {
  const app = useApp();
  const [seed, setSeed] = useState('');
  const [disabled, setDisabled] = useState(false);

  const checked = useMemo(
    () => utils.isValidMnemonic(seed.trim()) || utils.isHexString(seed.trim()),
    [seed],
  );

  const onDone = useCallback(() => {
    setDisabled(true);
    try {
      navigation.replace(route.params.nextScreen ?? 'onboarding-setup-pin', {
        mnemonic: utils.isValidMnemonic(seed.trim()) && seed.trim(),
        privateKey: utils.isHexString(seed.trim()) && seed.trim(),
      });
    } catch (e) {
      Sentry.captureException(e);
    } finally {
      setDisabled(false);
      app.emit('modal', null);
    }
  }, [app, seed, navigation, route]);

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
        disabled={!checked || disabled}
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
