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
  Text,
  Spacer,
  TextField,
} from '../components/ui';
import {TEXT_BASE_2, TEXT_GREEN_1} from '../variables';
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
    <KeyboardSafeArea style={page.container}>
      <Text t11 style={page.intro}>
        Recovery phrase or Private key
      </Text>
      <TextField
        placeholder="Enter or paste your recovery phrase"
        style={page.input}
        label="Backup phrase"
        value={seed}
        onChangeText={setSeed}
        multiline
        errorText="Incorrect address"
      />

      <IconButton onPress={onPressPaste} style={page.button}>
        <Text t14 style={page.t14}>
          Paste from Clipboard
        </Text>
      </IconButton>
      <Spacer />
      <Button
        disabled={!checked || disabled}
        title="Recovery"
        onPress={onDone}
        variant={ButtonVariant.contained}
        style={page.submit}
      />
    </KeyboardSafeArea>
  );
};

const page = StyleSheet.create({
  container: {paddingHorizontal: 20, paddingTop: 20},
  button: {alignSelf: 'flex-start'},
  intro: {
    marginBottom: 32,
    color: TEXT_BASE_2,
  },
  input: {
    marginBottom: 8,
  },
  t14: {color: TEXT_GREEN_1, fontWeight: '600', textAlign: 'left'},
  submit: {
    marginVertical: 16,
  },
});
