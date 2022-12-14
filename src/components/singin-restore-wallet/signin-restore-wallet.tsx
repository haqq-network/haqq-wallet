import React, {useCallback, useMemo, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import * as Sentry from '@sentry/react-native';
import {utils} from 'ethers';
import {ScrollView, StyleSheet} from 'react-native';

import {Color, getColor} from '@app/colors';
import {
  Button,
  ButtonVariant,
  IconButton,
  KeyboardSafeArea,
  Spacer,
  Text,
  TextField,
} from '@app/components/ui';
import {hideModal} from '@app/helpers';
import {I18N} from '@app/i18n';

interface SinginRestoreWalletProps {
  onDoneTry: (seed: string) => void;
}

export const SignInRestore = ({onDoneTry}: SinginRestoreWalletProps) => {
  const [disabled, setDisabled] = useState(false);
  const [seed, setSeed] = useState('');

  const checked = useMemo(
    () =>
      utils.isValidMnemonic(seed.trim()) ||
      utils.isHexString(seed.trim()) ||
      utils.isHexString(`0x${seed}`.trim()),
    [seed],
  );

  const onDone = useCallback(() => {
    setDisabled(true);
    try {
      onDoneTry(seed);
    } catch (e) {
      Sentry.captureException(e);
    } finally {
      setDisabled(false);
      hideModal();
    }
  }, [seed, onDoneTry]);

  const onChangeKey = useCallback((key: string) => {
    setSeed(key.replace(/\n/gm, ''));
  }, []);

  const onPressPaste = useCallback(async () => {
    const text = await Clipboard.getString();
    onChangeKey(text.trim());
  }, [onChangeKey]);

  return (
    <ScrollView
      contentContainerStyle={page.scrollContent}
      showsVerticalScrollIndicator={false}>
      <KeyboardSafeArea style={page.container} testID="signin_restore">
        <Text
          t11
          color={getColor(Color.textBase2)}
          i18n={I18N.signinRestoreWalletPhraseOrKey}
          style={page.intro}
        />
        <TextField
          placeholder={I18N.signinRestoreWalletTextFieldPlaceholder}
          style={page.input}
          label={I18N.signinRestoreWalletTextFieldLabel}
          value={seed}
          onChangeText={onChangeKey}
          multiline
          errorTextI18n={I18N.signinRestoreWalletTextFieldError}
        />

        <IconButton onPress={onPressPaste} style={page.button}>
          <Text
            t14
            color={Color.graphicGreen2}
            i18n={I18N.signinRestoreWalletPasteClipboard}
          />
        </IconButton>
        <Spacer />
        <Button
          disabled={!checked || disabled}
          i18n={I18N.signinRestoreWalletRecovery}
          onPress={onDone}
          variant={ButtonVariant.contained}
          style={page.submit}
        />
      </KeyboardSafeArea>
    </ScrollView>
  );
};

const page = StyleSheet.create({
  scrollContent: {flexGrow: 1},
  container: {paddingHorizontal: 20, paddingTop: 20},
  button: {alignSelf: 'flex-start'},
  intro: {
    marginBottom: 32,
  },
  input: {
    marginBottom: 8,
  },
  submit: {
    marginVertical: 16,
  },
});
