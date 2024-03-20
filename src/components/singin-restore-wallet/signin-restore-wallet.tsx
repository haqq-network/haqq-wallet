import React, {useCallback, useMemo, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {utils} from 'ethers';
import {Keyboard, ScrollView, StyleSheet} from 'react-native';

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
import {ModalType} from '@app/types';

interface SinginRestoreWalletProps {
  onDoneTry: (seed: string) => Promise<void>;
  testID?: string;
}

export const SignInRestore = ({
  onDoneTry,
  testID,
}: SinginRestoreWalletProps) => {
  const [seed, setSeed] = useState('');

  const checked = useMemo(() => {
    let s = seed.trim();

    if (utils.isValidMnemonic(s.toLowerCase())) {
      return true;
    }

    if (!s.startsWith('0x')) {
      s = `0x${seed}`;
    }

    return utils.isHexString(s, 32);
  }, [seed]);

  const onDone = useCallback(async () => {
    try {
      await onDoneTry(seed);
    } catch (e) {
      Logger.captureException(e);
    } finally {
      hideModal(ModalType.loading);
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
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      testID={testID}>
      <KeyboardSafeArea style={page.container} testID={`${testID}_area`}>
        <Text
          t11
          color={getColor(Color.textBase2)}
          i18n={I18N.signinRestoreWalletPhraseOrKey}
          style={page.intro}
        />
        <TextField
          autoFocus
          placeholder={I18N.signinRestoreWalletTextFieldPlaceholder}
          style={page.input}
          label={I18N.signinRestoreWalletTextFieldLabel}
          value={seed}
          onChangeText={onChangeKey}
          multiline
          errorTextI18n={I18N.signinRestoreWalletTextFieldError}
          testID={`${testID}_input`}
          onKeyPress={({nativeEvent: {key: keyValue}}) => {
            if (keyValue === 'Enter') {
              Keyboard.dismiss();
            }
          }}
        />

        <IconButton onPress={onPressPaste} style={page.button}>
          <Text
            color={Color.textGreen1}
            t14
            i18n={I18N.signinRestoreWalletPasteClipboard}
          />
        </IconButton>
        <Spacer />
        <Button
          disabled={!checked}
          i18n={I18N.signinRestoreWalletRecovery}
          onPress={onDone}
          variant={ButtonVariant.contained}
          style={page.submit}
          testID={`${testID}_submit`}
          trackLoading
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
