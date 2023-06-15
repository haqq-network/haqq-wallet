import React, {useCallback, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  ErrorText,
  Icon,
  IconButton,
  Input,
  Loading,
  PopupContainer,
  Spacer,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export enum PasswordExists {
  checking,
  exists,
  not_exists,
}

export type SssBackupProps = {
  isPasswordExists: PasswordExists;

  onCheckPassword: (code: string) => Promise<void>;
  onCheckGoogleDrive: () => Promise<void>;
  onSkip: () => void;
};

export const SssBackup = ({
  isPasswordExists,
  onCheckPassword,
  onCheckGoogleDrive,
  onSkip,
}: SssBackupProps) => {
  const [password, setPassword] = useState('');
  const [incorrectPassword, setIncorrectPassword] = useState(false);
  const [isPasswordChecking, setIsPasswordChecking] = useState(false);
  const [isGoogleDriveChecking, setIsGoogleDriveChecking] = useState(false);

  const onPressPaste = useCallback(async () => {
    const pasteString = await Clipboard.getString();

    setPassword(pasteString);
  }, []);

  const onPressCheckPinCode = useCallback(async () => {
    try {
      setIsPasswordChecking(true);
      await onCheckPassword(password);
    } catch (e) {
      setIncorrectPassword(true);
      setPassword('');
    } finally {
      setIsPasswordChecking(false);
    }
  }, [onCheckPassword, password]);

  const onPressCheckGoogleDrive = useCallback(async () => {
    try {
      setIsGoogleDriveChecking(true);
      await onCheckGoogleDrive();
    } finally {
      setIsGoogleDriveChecking(false);
    }
  }, [onCheckGoogleDrive]);

  if (isPasswordExists === PasswordExists.checking) {
    return (
      <PopupContainer>
        <Loading />
      </PopupContainer>
    );
  }

  return (
    <PopupContainer style={styles.container}>
      <Spacer />
      {isPasswordExists === PasswordExists.exists && (
        <>
          <Input
            placeholder="password"
            value={password}
            error={incorrectPassword}
            onChangeText={v => {
              setPassword(v);
              setIncorrectPassword(false);
            }}
            rightAction={
              <IconButton onPress={onPressPaste}>
                <Icon i24 name="paste" color={Color.graphicGreen1} />
              </IconButton>
            }
          />
          {incorrectPassword && (
            <>
              <Spacer height={4} />
              <ErrorText i18n={I18N.sssQuestionWrongPassword} />
            </>
          )}
          <Spacer height={4} />
          <Button
            title="Check password"
            loading={isPasswordChecking}
            onPress={onPressCheckPinCode}
            variant={ButtonVariant.contained}
          />
        </>
      )}
      <Spacer height={8} />
      <Button
        title="Check google drive"
        loading={isGoogleDriveChecking}
        onPress={onPressCheckGoogleDrive}
        variant={ButtonVariant.second}
      />
      <Spacer height={8} />
      <Button title="Continue without backup" onPress={onSkip} />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
